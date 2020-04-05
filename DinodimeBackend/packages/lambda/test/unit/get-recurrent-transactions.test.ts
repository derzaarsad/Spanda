/* eslint-env node, mocha */
import winston from "winston";
import chai from "chai";
const expect = chai.expect;

import { getRecurrentTransactions } from "../../src/controllers/bank-controller";
import { Context, APIGatewayProxyEvent } from "aws-lambda";
import { VoidTransport, FinAPI, User, BankConnection } from "dinodime-lib";
import { RecurrentTransactions, Users, BankConnections } from "dinodime-lib";
import { RecurrentTransaction } from "dinodime-lib";
import { TransactionFrequency } from "dinodime-lib";
import { CreateUnittestInterfaces } from "../test-utility";

describe("unit: get recurrent transactions", function() {
  let logger: winston.Logger;
  let context: Context;
  let users: Users.UsersRepository;
  let recurrentTransactions: RecurrentTransactions.RecurrentTransactionsRepository;
  let connections: BankConnections.BankConnectionsRepository;

  let dummyInterfaces = CreateUnittestInterfaces();

  beforeEach(function() {
    logger = winston.createLogger({ transports: [new VoidTransport()] });

    users = new Users.InMemoryRepository();
    recurrentTransactions = new RecurrentTransactions.InMemoryRepository();
    connections = new BankConnections.InMemoryRepository();

    context = {} as Context;
  });

  it("no authorization must fail", async function() {

    // adding recurrent transactions
    let recurrentTransactionsData: RecurrentTransaction[] = [
        new RecurrentTransaction(10, [1,2,3], 1023, true, "Dinodime1 GmbH"),
        new RecurrentTransaction(11, [4,5,6], 1023, true, "Dinodime2 GmbH"),
        new RecurrentTransaction(13, [1,2,3], 1023, true, "Dinodime3 GmbH"),
        new RecurrentTransaction(14, [4,5,6], 1023, true, "Dinodime4 GmbH"),
        new RecurrentTransaction(16, [1,2,3], 1023, true, "Dinodime5 GmbH"),
        new RecurrentTransaction(17, [4,5,6], 1023, true, "Dinodime6 GmbH")
    ];
    await recurrentTransactions.saveArrayWithoutId(recurrentTransactionsData);

    // adding user
    const user1 = new User("chapu", "chapu@mischung.net", "+666 666 666", false);
    user1.bankConnectionIds = [22,23,24];
    await users.save(user1);

    // adding connections
    const bankConnection1 = new BankConnection(22,220);
    const bankConnection2 = new BankConnection(23,230);
    const bankConnection3 = new BankConnection(24,240);
    bankConnection1.bankAccountIds = [10,11];
    bankConnection2.bankAccountIds = [13,14];
    bankConnection3.bankAccountIds = [16,17];
    await connections.save(bankConnection1);
    await connections.save(bankConnection2);
    await connections.save(bankConnection3);

    const event = ({
        headers: {
        }
      } as unknown) as APIGatewayProxyEvent;

    const result = await getRecurrentTransactions(
      event,
      context,
      logger,
      dummyInterfaces.bankInterface,
      users,
      connections,
      recurrentTransactions
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(401);

    const body = JSON.parse(result.body);
    expect(body.message).to.exist;
    expect(body.message).to.equal("unauthorized");
  });

  it("no bank connections must fail", async function() {

    // adding recurrent transactions
    let recurrentTransactionsData: RecurrentTransaction[] = [
        new RecurrentTransaction(10, [1,2,3], 1023, true, "Dinodime1 GmbH"),
        new RecurrentTransaction(11, [4,5,6], 1023, true, "Dinodime2 GmbH"),
        new RecurrentTransaction(13, [1,2,3], 1023, true, "Dinodime3 GmbH"),
        new RecurrentTransaction(14, [4,5,6], 1023, true, "Dinodime4 GmbH"),
        new RecurrentTransaction(16, [1,2,3], 1023, true, "Dinodime5 GmbH"),
        new RecurrentTransaction(17, [4,5,6], 1023, true, "Dinodime6 GmbH")
    ];
    await recurrentTransactions.saveArrayWithoutId(recurrentTransactionsData);

    // adding user
    const user1 = new User("chapu", "chapu@mischung.net", "+666 666 666", false);
    user1.bankConnectionIds = [22,23,24];
    await users.save(user1);

    const event = ({
        headers: {
          Authorization: "bearer 12345678"
        }
      } as unknown) as APIGatewayProxyEvent;

    const result = await getRecurrentTransactions(
      event,
      context,
      logger,
      dummyInterfaces.bankInterface,
      users,
      connections,
      recurrentTransactions
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(204);

    const body = JSON.parse(result.body);
    expect(body.message).to.exist;
    expect(body.message).to.equal("getting bank connections failed");
  });

  it("no user must fail", async function() {

    // adding recurrent transactions
    let recurrentTransactionsData: RecurrentTransaction[] = [
        new RecurrentTransaction(10, [1,2,3], 1023, true, "Dinodime1 GmbH"),
        new RecurrentTransaction(11, [4,5,6], 1023, true, "Dinodime2 GmbH"),
        new RecurrentTransaction(13, [1,2,3], 1023, true, "Dinodime3 GmbH"),
        new RecurrentTransaction(14, [4,5,6], 1023, true, "Dinodime4 GmbH"),
        new RecurrentTransaction(16, [1,2,3], 1023, true, "Dinodime5 GmbH"),
        new RecurrentTransaction(17, [4,5,6], 1023, true, "Dinodime6 GmbH")
    ];
    await recurrentTransactions.saveArrayWithoutId(recurrentTransactionsData);

    // adding connections
    const bankConnection1 = new BankConnection(22,220);
    const bankConnection2 = new BankConnection(23,230);
    const bankConnection3 = new BankConnection(24,240);
    bankConnection1.bankAccountIds = [10,11];
    bankConnection2.bankAccountIds = [13,14];
    bankConnection3.bankAccountIds = [16,17];
    await connections.save(bankConnection1);
    await connections.save(bankConnection2);
    await connections.save(bankConnection3);

    const event = ({
        headers: {
          Authorization: "bearer 12345678"
        }
      } as unknown) as APIGatewayProxyEvent;

    const result = await getRecurrentTransactions(
      event,
      context,
      logger,
      dummyInterfaces.bankInterface,
      users,
      connections,
      recurrentTransactions
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(401);

    const body = JSON.parse(result.body);
    expect(body.message).to.exist;
    expect(body.message).to.equal("unauthorized");
  });

  it("no recurrent transactions must success but with empty recurrenttransactions", async function() {

    // adding user
    const user1 = new User("chapu", "chapu@mischung.net", "+666 666 666", false);
    user1.bankConnectionIds = [22,23,24];
    await users.save(user1);

    // adding connections
    const bankConnection1 = new BankConnection(22,220);
    const bankConnection2 = new BankConnection(23,230);
    const bankConnection3 = new BankConnection(24,240);
    bankConnection1.bankAccountIds = [10,11];
    bankConnection2.bankAccountIds = [13,14];
    bankConnection3.bankAccountIds = [16,17];
    await connections.save(bankConnection1);
    await connections.save(bankConnection2);
    await connections.save(bankConnection3);

    const event = ({
        headers: {
          Authorization: "bearer 12345678"
        }
      } as unknown) as APIGatewayProxyEvent;

    const result = await getRecurrentTransactions(
      event,
      context,
      logger,
      dummyInterfaces.bankInterface,
      users,
      connections,
      recurrentTransactions
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(200);

    const body = JSON.parse(result.body);
    expect(body.recurrenttransactions).to.exist;
    expect(body.recurrenttransactions.length).to.equal(0);
  });

  it("recurrent transactions, bank connections and authorization are available", async function() {

    // adding recurrent transactions
    let recurrentTransactionsData: RecurrentTransaction[] = [
        new RecurrentTransaction(10, [1,2,3], 1023, true, "Dinodime1 GmbH"),
        new RecurrentTransaction(11, [4,5,6], 1023, true, "Dinodime2 GmbH"),
        new RecurrentTransaction(13, [1,2,3], 1023, true, "Dinodime3 GmbH"),
        new RecurrentTransaction(14, [4,5,6], 1023, true, "Dinodime4 GmbH"),
        new RecurrentTransaction(16, [1,2,3], 1023, true, "Dinodime5 GmbH"),
        new RecurrentTransaction(17, [4,5,6], 1023, true, "Dinodime6 GmbH")
    ];
    await recurrentTransactions.saveArrayWithoutId(recurrentTransactionsData);

    // adding user
    const user1 = new User("chapu", "chapu@mischung.net", "+666 666 666", false);
    user1.bankConnectionIds = [22,23,24];
    await users.save(user1);

    // adding connections
    const bankConnection1 = new BankConnection(22,220);
    const bankConnection2 = new BankConnection(23,230);
    const bankConnection3 = new BankConnection(24,240);
    bankConnection1.bankAccountIds = [10,11];
    bankConnection2.bankAccountIds = [13,14];
    bankConnection3.bankAccountIds = [16,17];
    await connections.save(bankConnection1);
    await connections.save(bankConnection2);
    await connections.save(bankConnection3);

    const event = ({
        headers: {
          Authorization: "bearer 12345678"
        }
      } as unknown) as APIGatewayProxyEvent;

    const result = await getRecurrentTransactions(
      event,
      context,
      logger,
      dummyInterfaces.bankInterface,
      users,
      connections,
      recurrentTransactions
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(200);

    const body = JSON.parse(result.body);
    expect(body.recurrenttransactions).to.exist;
    expect(body.recurrenttransactions.length).to.equal(6);
    expect(body.recurrenttransactions[0].id).to.exist;
    expect(body.recurrenttransactions[0].accountId).to.exist;
    expect(body.recurrenttransactions[0].absAmount).to.exist;
    expect(body.recurrenttransactions[0].isExpense).to.exist;
    expect(body.recurrenttransactions[0].isConfirmed).to.exist;
    expect(body.recurrenttransactions[0].frequency).to.exist;
    expect(body.recurrenttransactions[0].counterPartName).to.equal("Dinodime1 GmbH");
    expect(body.recurrenttransactions[1].counterPartName).to.equal("Dinodime2 GmbH");
    expect(body.recurrenttransactions[2].counterPartName).to.equal("Dinodime3 GmbH");
    expect(body.recurrenttransactions[3].counterPartName).to.equal("Dinodime4 GmbH");
    expect(body.recurrenttransactions[4].counterPartName).to.equal("Dinodime5 GmbH");
    expect(body.recurrenttransactions[5].counterPartName).to.equal("Dinodime6 GmbH");

    expect(body.recurrenttransactions[0].id).to.equal(1);
    expect(body.recurrenttransactions[1].id).to.equal(2);
    expect(body.recurrenttransactions[2].id).to.equal(3);
    expect(body.recurrenttransactions[3].id).to.equal(4);
    expect(body.recurrenttransactions[4].id).to.equal(5);
    expect(body.recurrenttransactions[5].id).to.equal(6);
  });
});
