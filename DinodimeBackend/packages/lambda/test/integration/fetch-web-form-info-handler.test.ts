import chai from "chai";
const expect = chai.expect;
import winston from "winston";

import { Context, APIGatewayProxyEvent } from "aws-lambda";
import { FinAPI } from "dinodime-lib";
import { User, Users, BankConnections, Transactions, VoidTransport, CallbackCrypto } from "dinodime-lib";

import { fetchWebFormInfo } from "../../src/controllers/bank-controller";
import { CreateFinApiTestInterfaces } from "../test-utility";
import { EncryptedData, Encryptions } from "dinodime-lib/out/src/crypto";

import { Pool } from "pg";
import format from "pg-format";
import { UsersSchema } from "dinodime-lib";
import { BankConnectionsSchema } from "dinodime-lib";
import { TransactionsSchema } from "dinodime-lib";

describe("integration: fetch webform info handler", function() {
  this.timeout(10000); // Webform needs time.

  let logger: winston.Logger;
  let users: Users.UsersRepository;
  let connections: BankConnections.BankConnectionsRepository;
  let transactions: Transactions.TransactionsRepository;
  let context: Context;
  let encryptions: Encryptions;
  let encrypted: EncryptedData;

  expect(process.env.FinAPIClientId).to.exist;
  expect(process.env.FinAPIClientSecret).to.exist;
  expect(process.env.WEBFORM_ID_FOR_FETCH).to.exist;
  expect(process.env.ACCESS_TOKEN_FOR_FETCH).to.exist;

  let dummyInterfaces = CreateFinApiTestInterfaces(process.env.FinAPIClientId!, process.env.FinAPIClientSecret!);

  beforeEach(async function() {
    logger = winston.createLogger({ transports: [new VoidTransport()] });

    users = new Users.PostgreSQLRepository(new Pool(), format, new UsersSchema());
    connections = new BankConnections.PostgreSQLRepository(new Pool(), format, new BankConnectionsSchema());
    transactions = new Transactions.PostgreSQLRepository(new Pool(), format, new TransactionsSchema());

    context = {} as Context;
    encryptions = new CallbackCrypto();
    encrypted = encryptions.EncryptText("bearer " + process.env.ACCESS_TOKEN_FOR_FETCH!);
  });

  afterEach(async function() {
    await users.deleteAll();
    await connections.deleteAll();
    await transactions.deleteAll();
  });

  it("rejects a request with could not fetch web form", async function() {
    const rejectedWebId = parseInt(process.env.WEBFORM_ID_FOR_FETCH! + "111");

    const user = new User("chapu", "chapu@mischung.net", "+666 666 666", false);
    user.activeWebFormId = rejectedWebId;
    user.activeWebFormAuth = encrypted.iv;
    await users.save(user);

    const event = ({
      headers: {},
      pathParameters: {
        webFormAuth: rejectedWebId + "-" + encrypted.cipherText
      }
    } as unknown) as APIGatewayProxyEvent;

    const result = await fetchWebFormInfo(
      event,
      context,
      logger,
      dummyInterfaces.bankInterface,
      users,
      connections,
      transactions,
      encryptions
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(500);
    expect(JSON.parse(result.body).message).to.include("could not fetch web form");
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

    const event = ({
      headers: {},
      pathParameters: {
        webFormAuth: "2934-" + encrypted.cipherText
      }
    } as unknown) as APIGatewayProxyEvent;
    const result = await fetchWebFormInfo(
      event,
      context,
      logger,
      finapi,
      users,
      connections,
      transactions,
      encryptions
    );
    expect(result.statusCode).to.equal(200);
    expect(result).to.be.an("object");

    const responseBody = JSON.parse(result.body);
    expect(responseBody, "the response body appears to be undefined").to.be.ok;
    expect(responseBody).to.be.an("object", "expected the response body to be an object");
    expect(responseBody.id).to.be.an("number", "expected the response id to be a number");
    expect(responseBody.bankId).to.be.an("number", "expected the response bankId to be a number");

    const bankConnectionId = responseBody.id;

    const user_ = await users.findById("chapu");
    expect(user_, "no user found for the given username").to.be.ok;
    expect(user_!.bankConnectionIds).to.include(bankConnectionId, "the connection ids were not updated");

    const connection = await connections.findById(bankConnectionId);
    expect(connection, "the connection was not created").to.be.ok;
    expect(connection!.bankAccountIds[0]).to.be.an("number", "expected the bankAccountIds element to be a number");

    const transactions_ = await transactions.findByAccountIds(connection!.bankAccountIds);
    expect(transactions_).to.exist;
    expect(transactions_.length).to.be.not.empty;
    expect(transactions_[0].id).to.exist;
    expect(transactions_[0].accountId).to.equal(connection!.bankAccountIds[0]);
    expect(transactions_[0].absAmount).to.exist;
  });
});
