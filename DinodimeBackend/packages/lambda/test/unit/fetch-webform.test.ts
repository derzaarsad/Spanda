/* eslint-env node, mocha */
import winston from "winston";
import chai from "chai";
const expect = chai.expect;

import { SQSRecord, Context } from "aws-lambda";
import { VoidTransport, FinAPI, Users, User, Failure } from "dinodime-lib";
import { WebFormCompletion } from "dinodime-lib";
import { BankConnections, Transactions } from "dinodime-lib";
import { Encryptions, CallbackCrypto } from "dinodime-lib";
import { MockSQSClient } from "dinodime-lib";
import { handleRecord, HandlerConfiguration } from "../../src/fetch-webform";

describe("fetch webform info handler", function() {
  let logger: winston.Logger;
  let users: Users.UsersRepository;
  let connections: BankConnections.BankConnectionsRepository;
  let transactions: Transactions.TransactionsRepository;
  let context: Context;
  let encryptions: Encryptions;
  let sqs: MockSQSClient;

  function createConfiguration(bankInterface: FinAPI): HandlerConfiguration {
    return {
      bankInterface: bankInterface,
      users: users,
      connections: connections,
      transactions: transactions,
      encryptions: encryptions,
      log: logger,
      sqs: sqs
    };
  }

  beforeEach(function() {
    logger = winston.createLogger({ transports: [new VoidTransport()] });

    users = new Users.InMemoryRepository();
    connections = new BankConnections.InMemoryRepository();
    transactions = new Transactions.InMemoryRepository();

    context = {} as Context;
    encryptions = new CallbackCrypto();
  });

  it("rejects a request with missing webFormAuth", async function() {
    const finapi = {} as FinAPI;
    const configuration = createConfiguration(finapi);

    const record = { body: "{}" } as SQSRecord;

    const result = await handleRecord(record, context, configuration);
    expect(result).to.be.an("object");
    expect(result.kind).to.equal("failure");
    expect((result as Failure).error.message).to.contain("no user found");
  });

  it("rejects a request with no user found", async function() {
    const finapi = {} as FinAPI;
    const configuration = createConfiguration(finapi);

    const completion: WebFormCompletion = {
      webFormId: 2934,
      userSecret: "5jkntkzt5nj53zi9975"
    };
    const record = { body: JSON.stringify(completion) } as SQSRecord;

    const result = await handleRecord(record, context, configuration);
    expect(result).to.be.an("object");
    expect(result.kind).to.equal("failure");
    expect((result as Failure).error.message).to.contain("no user found");
  });

  it("rejects a request with could not fetch web form", async function() {
    const encrypted = encryptions.EncryptText("bearer 5jkntkzt5nj53zi99754563nb3b64zb");
    const user = new User("chapu", "chapu@mischung.net", "+666 666 666", false);
    user.activeWebFormId = 2934;
    user.activeWebFormAuth = encrypted.iv;
    await users.save(user);

    const finapi = ({
      fetchWebForm: async () => {
        throw "nada";
      }
    } as unknown) as FinAPI;

    const configuration = createConfiguration(finapi);

    const completion: WebFormCompletion = {
      webFormId: 2934,
      userSecret: encrypted.cipherText
    };
    const record = { body: JSON.stringify(completion) } as SQSRecord;

    const result = await handleRecord(record, context, configuration);
    expect(result).to.be.an("object");
    expect(result.kind).to.equal("failure");
    expect((result as Failure).error.message).to.contain("could not fetch web form");
  });

  it("rejects a request because of empty body", async function() {
    const encrypted = encryptions.EncryptText("bearer 5jkntkzt5nj53zi99754563nb3b64zb");
    const user = new User("chapu", "chapu@mischung.net", "+666 666 666", false);
    user.activeWebFormId = 2934;
    user.activeWebFormAuth = encrypted.iv;
    await users.save(user);

    const finapi = ({
      fetchWebForm: async () => {
        return {};
      }
    } as unknown) as FinAPI;

    const configuration = createConfiguration(finapi);

    const completion: WebFormCompletion = {
      webFormId: 2934,
      userSecret: encrypted.cipherText
    };
    const record = { body: JSON.stringify(completion) } as SQSRecord;

    const result = await handleRecord(record, context, configuration);
    expect(result).to.be.an("object");
    expect(result.kind).to.equal("failure");
    expect((result as Failure).error.message).to.contain("empty body");
  });

  it("adds a connection to the user", async function() {
    let access_token = "bearer 5jkntkzt5nj53zi99754563nb3b64zb";
    const encrypted = encryptions.EncryptText(access_token);
    const user = new User("chapu", "chapu@mischung.net", "+666 666 666", false);
    user.activeWebFormId = 2934;
    user.activeWebFormAuth = encrypted.iv;
    await users.save(user);

    const finapi = ({
      fetchWebForm: async (authorization: string) => {
        if (authorization !== access_token) {
          return {};
        }
        return {
          serviceResponseBody: '{ "id": 1, "bankId": 2, "accountIds": [ 3, 4, 5 ] }'
        };
      },

      getAllTransactions: async () => {
        return [
          {
            id: 1112,
            accountId: 3,
            amount: -89.871,
            finapiBookingDate: "2018-01-01 00:00:00.000",
            purpose: " RE. 745259",
            counterPartName: "TueV Bayern",
            counterPartAccountNumber: "611105",
            counterPartIban: "DE13700800000061110500",
            counterPartBlz: "70080000",
            counterPartBic: "DRESDEFF700",
            counterPartBankName: "Commerzbank vormals Dresdner Bank"
          }
        ];
      }
    } as unknown) as FinAPI;

    const configuration = createConfiguration(finapi);

    const completion: WebFormCompletion = {
      webFormId: 2934,
      userSecret: encrypted.cipherText
    };
    const record = { body: JSON.stringify(completion) } as SQSRecord;

    const result = await handleRecord(record, context, configuration);
    expect(result.kind).to.equal("success");

    const user_ = await users.findById("chapu");
    expect(user_, "no user found for the given username").to.be.ok;
    expect(user_!.bankConnectionIds).to.include(1, "the connection ids were not updated");

    const connection = await connections.findById(1);
    expect(connection, "the connection was not created").to.be.ok;
    expect(connection!.bankAccountIds)
      .to.be.an("array")
      .that.includes.members([3, 4, 5], "the account ids were not assigned to the bank connection");
  });
});
