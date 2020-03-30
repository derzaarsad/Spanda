import chai from "chai";
import axios, { AxiosInstance } from "axios";
import winston from "winston";

import AWS from "aws-sdk";
import SQS, { MessageList, DeleteMessageBatchRequest, DeleteMessageBatchResult } from "aws-sdk/clients/sqs";

import { Pool } from "pg";
import format from "pg-format";

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

describe("authenticate user handler", function() {
  let logger: winston.Logger;
  let users: Users.UsersRepository;
  let transactions: Transactions.TransactionsRepository;
  let bankConnections: BankConnections.BankConnectionsRepository;

  let webFormCallbackHandlerConfiguration: WebFormCallbackHandlerConfiguration;
  let fetchWebFormHandlerConfiguration: FetchWebFormHandlerConfiguration;

  before(function() {
    logger = winston.createLogger({
      level: "debug",
      format: winston.format.json()
    });

    const mockFinApiClient = axios.create({
      baseURL: endpointURL,
      timeout: 3000,
      headers: { Accept: "application/json" }
    });
    const sqs = new SQS();

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
  });

  it("works when the user is authenticated", async () => {
    const user = new User("demo", "demo@localhost.de", "+49 99 999999-999", true);
    user.activeWebFormAuth = "covfefe";
    user.activeWebFormId = 666;

    logger.info(`Persisting user ${user.username}...`);
    await users.save(user);

    assert.isTrue(true, "test cannot fail");
  });

  afterEach(async function() {
    await transactions.deleteAll();
    await bankConnections.deleteAll();
    await users.deleteAll();
  });
});
