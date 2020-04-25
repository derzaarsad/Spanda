import * as winston from "winston";
import qs from "querystring";
import { CreateSimpleResponse } from "./lambda-util";
import { Status, Success, Failure } from "dinodime-lib";
import { SQSEvent, SQSRecord } from "aws-lambda";
import {
  Crypto,
  Transactions,
  BankConnections,
  Users,
  FinAPI,
  WebFormCompletion,
  BankConnection,
  SQSClient,
  SQSPublisher,
  PushMessaging
} from "dinodime-lib";

import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";

// Since this can be called by anyone, we don't reveal anything in the frontend response
const response = CreateSimpleResponse(202, "Accepted");

export interface WebFormCallbackHandlerConfiguration {
  sqs: SQSPublisher;
  users: Users.UsersRepository;
  pushMessaging: PushMessaging
  log: winston.Logger;
}

/**
 * Receives a webform coordinates as path parameters and puts a WebFormCompletion on an SQS queue.
 */
export const webFormCallbackHandler = async (
  event: APIGatewayProxyEvent,
  context: Context,
  configuration: WebFormCallbackHandlerConfiguration
): Promise<APIGatewayProxyResult> => {
  const log = configuration.log;
  const sqs = configuration.sqs;
  const users = configuration.users;
  const pushMessaging = configuration.pushMessaging;

  const pathParameters = event.pathParameters;
  if (pathParameters === null || !pathParameters.webFormAuth) {
    log.error("No authorization provided");
    return response;
  }

  const webFormAuth = qs.unescape(pathParameters.webFormAuth);
  const splitkey = "-";
  const tokens = webFormAuth.split(splitkey);
  if (tokens.length < 3) {
    log.error(`Invalid webform authorization received: ${webFormAuth}`);
    return response;
  }

  const webFormId = parseInt(tokens[0]);
  const userSecret = tokens[1];
  const pushToken = tokens.slice(2).join(splitkey);

  // Push a signal to the app to close the webform page.
  // This signal should not have an await
  pushMessaging.sendMessage(pushToken,{}, "push from webformCallback").then(res => {
    log.info(res);
  }).catch(err => {
    log.error(err);
  });

  if (isNaN(webFormId) || userSecret.length === 0) {
    log.error(`Invalid webform authorization received: ${webFormAuth}`);
    return response;
  }

  const user = await users.findByWebFormId(webFormId);
  if (user === null || user.activeWebFormId === null || user.activeWebFormAuth === null) {
    log.error(`No user found for webId ${webFormId} or user has no associated webform auth`);
    return response;
  }

  const messageBody: WebFormCompletion = {
    webFormId: webFormId,
    userSecret: userSecret,
  };

  const sendMessageRequest = {
    messageBody: messageBody,
  };

  return sqs
    .publish(sendMessageRequest)
    .then((status: Status<String>) => {
      if (status.kind === "success") {
        log.info(`Successfully sent message ${status.result} to queue`, status);
      } else {
        log.error("Could not send message message to queue: ", status.error);
      }
      return response;
    })
    .catch((err) => {
      log.error("Error sending message to topic", err);
      return response;
    });
};

export interface FetchWebFormHandlerConfiguration {
  sqs: SQSClient;
  log: winston.Logger;
  bankInterface: FinAPI;
  users: Users.UsersRepository;
  connections: BankConnections.BankConnectionsRepository;
  transactions: Transactions.TransactionsRepository;
  encryptions: Crypto;
}

/*
 * Receives Webform completions from an SQS queue and fetches the transactions from the imported
 * bank connections.
 */
export const fetchWebFormHandler = async (
  event: SQSEvent,
  context: Context,
  configuration: FetchWebFormHandlerConfiguration
) => {
  const log = configuration.log;
  const records = event.Records;
  let success = true;

  for (let i = 0; i < records.length; i++) {
    const record = records[i];

    const status: Status<String> = await handleRecord(record, context, configuration).catch((err) => {
      log.error("unexpected error processing transactions data: ", err);
      return { kind: "failure", error: err };
    });

    if (status.kind === "failure") {
      log.error("Message handling returned a failure: ", status.error);
      success = false;
    }
  }

  if (!success) {
    throw new Error("Some messages were not processed successfully!");
  }
};

export const handleRecord = async (
  record: SQSRecord,
  context: Context,
  configuration: FetchWebFormHandlerConfiguration
): Promise<Status<String>> => {
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
    return { kind: "failure", error: new Error(`No user for webform ${completion.webFormId} found`) };
  }

  if (user.activeWebFormAuth !== completion.userSecret) {
    return { kind: "failure", error: new Error("user secret doesn't match") };
  }

  const authorization = encryptions.decrypt(completion.userSecret);

  let webForm: { serviceResponseBody: string };
  try {
    webForm = await bankInterface.fetchWebForm(authorization, completion.webFormId);
  } catch (err) {
    return { kind: "failure", error: new Error("could not fetch web form") };
  }

  if (!webForm.serviceResponseBody) {
    return { kind: "failure", error: new Error("empty service response body") };
  }

  const body = JSON.parse(webForm.serviceResponseBody);
  if (!body.accountIds || body.accountIds.length == 0) {
    return { kind: "failure", error: new Error("no accound IDs available") };
  }

  const transactionsDataBankSpecific = await bankInterface.getAllTransactions(authorization, body.accountIds);

  const transactionsData = transactionsDataBankSpecific.map((transaction) => Transactions.fromFinAPI(transaction));

  const bankConnection = new BankConnection(body.id, body.bankId);
  bankConnection.bankAccountIds = body.accountIds;

  user.bankConnectionIds.push(body.id);

  // TODO: rollback on failure
  return Promise.all([users.save(user), connections.save(bankConnection), transactions.saveArray(transactionsData)])
    .then(() => {
      const status: Success<String> = { kind: "success", result: record.messageId };
      return status;
    })
    .catch((err) => {
      const status: Failure = { kind: "failure", error: err };
      return status;
    });
};
