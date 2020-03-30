import chai from "chai";
import axios, { AxiosInstance } from "axios";
import winston from "winston";

import AWS from "aws-sdk";
import { Context, APIGatewayProxyEvent } from "aws-lambda";
import SQS, { MessageList } from "aws-sdk/clients/sqs";

import { Pool } from "pg";
import format from "pg-format";

import { deleteMessages } from "./util";
import { CallbackCrypto, FinAPI } from "dinodime-lib";
import { AWSSQSPublisher, AWSSQSClient } from "dinodime-lib";
import { Users, UsersSchema, User } from "dinodime-lib";
import { Transactions, TransactionsSchema, Transaction } from "dinodime-lib";
import { BankConnections, BankConnectionsSchema, BankConnection } from "dinodime-lib";
import { WebFormCallbackHandlerConfiguration, webFormCallbackHandler } from "dinodime-lambda";
import { FetchWebFormHandlerConfiguration, fetchWebFormHandler } from "dinodime-lambda";

const assert = chai.assert;
const expect = chai.expect;
AWS.config.update({ region: process.env.CDK_DEPLOY_REGION });

const env = process.env;
const endpointURL = env["ENDPOINT_URL"] as string;
const queueURL = env["QUEUE_URL"] as string;

describe("integration: web form callback", function() {
  this.timeout(20000);

  let logger: winston.Logger;
  let sqs: SQS;
  let users: Users.UsersRepository;
  let transactions: Transactions.TransactionsRepository;
  let bankConnections: BankConnections.BankConnectionsRepository;
  let context: Context;

  let webFormCallbackHandlerConfiguration: WebFormCallbackHandlerConfiguration;
  let fetchWebFormHandlerConfiguration: FetchWebFormHandlerConfiguration;

  before(function() {
    logger = winston.createLogger({
      level: "debug",
      transports: [
        new winston.transports.Console({
          format: winston.format.simple()
        })
      ]
    });

    sqs = new SQS();

    const mockFinApiClient = axios.create({
      baseURL: endpointURL,
      timeout: 3000,
      headers: { Accept: "application/json" }
    });

    const pool = new Pool();
    users = new Users.PostgreSQLRepository(pool, format, new UsersSchema());
    transactions = new Transactions.PostgreSQLRepository(pool, format, new TransactionsSchema());
    bankConnections = new BankConnections.PostgreSQLRepository(pool, format, new BankConnectionsSchema());

    webFormCallbackHandlerConfiguration = { log: logger, sqs: new AWSSQSPublisher(sqs, queueURL), users: users };
    fetchWebFormHandlerConfiguration = {
      log: logger,
      sqs: new AWSSQSClient(sqs, queueURL),
      users: users,
      transactions: transactions,
      connections: bankConnections,
      encryptions: new CallbackCrypto(),
      bankInterface: new FinAPI(mockFinApiClient)
    };

    logger.info(`Configured test with queue url ${queueURL} and endpoint url ${endpointURL}`);
  });

  it("posts an SQS message when the user is authenticated", async () => {
    const user = new User("demo", "demo@localhost.de", "+49 99 999999-999", true);
    user.activeWebFormAuth = "covfefe";
    user.activeWebFormId = 666;

    logger.info(`Persisting user ${user.username}...`);
    await users.save(user);

    const callbackEvent = ({
      headers: {},
      pathParameters: {
        webFormAuth: 666 + "-covfefe"
      }
    } as unknown) as APIGatewayProxyEvent;

    const callbackResponse = await webFormCallbackHandler(callbackEvent, context, webFormCallbackHandlerConfiguration);
    expect(callbackResponse).to.be.an("object");
    expect(callbackResponse.statusCode).to.equal(202);

    const messages: MessageList | undefined = await sqs
      .receiveMessage({ QueueUrl: queueURL, AttributeNames: ["All"], WaitTimeSeconds: 10, MaxNumberOfMessages: 1 })
      .promise()
      .then(result => {
        return result.Messages;
      });

    logger.info("Received messages", messages);
    if (!messages) {
      logger.info(`Skipped deleting messages`);
    } else {
      logger.info(`Deleting ${messages.length} message(s) from queue ${queueURL}`);
      await deleteMessages(sqs, queueURL, messages);
    }

    expect(messages).to.be.ok;
    expect(messages!.length).to.eq(1);
  });

  afterEach(async function() {
    await transactions.deleteAll();
    await bankConnections.deleteAll();
    await users.deleteAll();
  });
});
