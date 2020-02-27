import * as winston from "winston";
import { Status, Success, Failure } from "dinodime-lib";
import { SQSEvent, SQSRecord, Context } from "aws-lambda";
import {
  Encryptions,
  Transactions,
  BankConnections,
  Users,
  FinAPI,
  WebFormCompletion,
  BankConnection,
  SQSClient
} from "dinodime-lib";

export interface HandlerConfiguration {
  sqs: SQSClient;
  log: winston.Logger;
  bankInterface: FinAPI;
  users: Users.UsersRepository;
  connections: BankConnections.BankConnectionsRepository;
  transactions: Transactions.TransactionsRepository;
  encryptions: Encryptions;
}

export const fetchWebForm = async (
  event: SQSEvent,
  context: Context,
  configuration: HandlerConfiguration
) => {
  const log = configuration.log;
  const sqs = configuration.sqs;

  event.Records.forEach(record => {
    handleRecord(record, context, configuration)
      .then(status => {
        handleStatus(record, status, configuration);
      })
      .catch(err => {
        log.error("Could not extract transactions data", err);
      });
  });
};

export const handleRecord = async (
  record: SQSRecord,
  context: Context,
  configuration: HandlerConfiguration
): Promise<Status> => {
  const users = configuration.users;
  const bankInterface = configuration.bankInterface;
  const transactions = configuration.transactions;
  const connections = configuration.connections;
  const encryptions = configuration.encryptions;

  let completion: WebFormCompletion;
  try {
    completion = JSON.parse(record.body) as WebFormCompletion;
  } catch (err) {
    return { kind: "failure", error: err };
  }

  const user = await users.findByWebFormId(completion.webFormId);
  if (user === null || user.activeWebFormId === null || user.activeWebFormAuth === null) {
    return { kind: "failure", error: new Error("no user found") };
  }

  const authorization = encryptions.DecryptText({
    iv: user.activeWebFormAuth,
    cipherText: completion.userSecret
  });

  let webForm: { serviceResponseBody: string };
  try {
    webForm = await bankInterface.fetchWebForm(authorization, completion.webFormId);
  } catch (err) {
    return { kind: "failure", error: new Error("could not fetch web form") };
  }

  if (!webForm.serviceResponseBody) {
    return { kind: "failure", error: new Error("empty body") };
  }

  const body = JSON.parse(webForm.serviceResponseBody);
  if (!body.accountIds || body.accountIds.length == 0) {
    return { kind: "failure", error: new Error("no accound IDs available") };
  }

  const transactionsDataBankSpecific = await bankInterface.getAllTransactions(
    authorization,
    body.accountIds
  );

  const transactionsData = transactionsDataBankSpecific.map(transaction =>
    Transactions.fromFinAPI(transaction)
  );

  const bankConnection = new BankConnection(body.id, body.bankId);
  bankConnection.bankAccountIds = body.accountIds;

  user.bankConnectionIds.push(body.id);

  // TODO: rollback on failure
  return Promise.all([
    users.save(user),
    connections.save(bankConnection),
    transactions.saveArray(transactionsData)
  ])
    .then(() => {
      const status: Success = { kind: "success" };
      return status;
    })
    .catch(err => {
      const status: Failure = { kind: "failure", error: err };
      return status;
    });
};

const handleStatus = async (
  record: SQSRecord,
  status: Status,
  configuration: HandlerConfiguration
) => {
  const log = configuration.log;
  if (status.kind === "failure") {
    log.error("Could not extract transactions data", status.error);
    return;
  }
  const sqs = configuration.sqs;
  const receiptHandle = record.receiptHandle;
  sqs
    .deleteMessage(receiptHandle)
    .then(() => {
      log.debug(`Deleted message with receipt handle ${receiptHandle} successfully`);
    })
    .catch(err => {
      log.error(`Error deleting SQS record with receipt handle ${receiptHandle}`, err);
    });
};
