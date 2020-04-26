/* eslint-env node, mocha */
import winston from "winston";
import chai from "chai";
const expect = chai.expect;

import { updateRecurrentTransactions } from "../../src/controllers/bank-controller";
import { Context, APIGatewayProxyEvent } from "aws-lambda";
import { VoidTransport, User } from "dinodime-lib";
import {
  RecurrentTransaction,
  RecurrentTransactions,
  RecurrentTransactionsSchema
} from "dinodime-lib";
import { Users } from "dinodime-lib";
import { CreateUnittestInterfaces } from "../test-utility";

import { Pool } from "pg";
import format from "pg-format";
import { UsersSchema } from "dinodime-lib";
import { TransactionFrequency } from "dinodime-sharedmodel";

describe("integration: update recurrent transactions", function() {
  let logger: winston.Logger;
  let context: Context;
  let users: Users.UsersRepository;
  let recurrentTransactions: RecurrentTransactions.RecurrentTransactionsRepository;

  /*
   * This integration test only test the Postgres database's behavior, FinAPI interface is not tested yet
   */
  let dummyInterfaces = CreateUnittestInterfaces();

  beforeEach(async function() {
    logger = winston.createLogger({ transports: [new VoidTransport()] });

    users = new Users.PostgreSQLRepository(new Pool(), format, new UsersSchema());
    recurrentTransactions = new RecurrentTransactions.PostgreSQLRepository(
      new Pool(),
      format,
      new RecurrentTransactionsSchema()
    );

    context = {} as Context;
  });

  afterEach(async function() {
    await users.deleteAll();
    await recurrentTransactions.deleteAll();
  });

  it("no auth must fail", async function() {
    const event = ({
      headers: {},
      body: JSON.stringify({})
    } as unknown) as APIGatewayProxyEvent;

    const result = await updateRecurrentTransactions(
      event,
      context,
      logger,
      dummyInterfaces.bankInterface,
      users,
      recurrentTransactions
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(401);
    expect(JSON.parse(result.body).message).to.include("unauthorized");
  });

  it("no user must fail", async function() {
    const event = ({
      headers: {
        Authorization: "bearer 12345678"
      },
      body: JSON.stringify({})
    } as unknown) as APIGatewayProxyEvent;

    const result = await updateRecurrentTransactions(
      event,
      context,
      logger,
      dummyInterfaces.bankInterface,
      users,
      recurrentTransactions
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(401);
    expect(JSON.parse(result.body).message).to.include("unauthorized");
  });

  it("no body must fail", async function() {
    const event = ({
      headers: {
        Authorization: "bearer 12345678"
      }
    } as unknown) as APIGatewayProxyEvent;

    await users.save(new User("chapu", "", ""));

    const result = await updateRecurrentTransactions(
      event,
      context,
      logger,
      dummyInterfaces.bankInterface,
      users,
      recurrentTransactions
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(400);
    expect(JSON.parse(result.body).message).to.include("empty body");
  });

  it("no recurrenttransactions in the body must fail", async function() {
    const event = ({
      headers: {
        Authorization: "bearer 12345678"
      },
      body: JSON.stringify({})
    } as unknown) as APIGatewayProxyEvent;

    await users.save(new User("chapu", "", ""));

    const result = await updateRecurrentTransactions(
      event,
      context,
      logger,
      dummyInterfaces.bankInterface,
      users,
      recurrentTransactions
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(400);
    expect(JSON.parse(result.body).message).to.include("invalid request");
  });

  it("if updateArray failed must fail", async function() {
    const event = ({
      headers: {
        Authorization: "bearer 12345678"
      },
      body: JSON.stringify({
        recurrenttransactions: [
          {
            Id: 1,
            AccountId: 1,
            AbsAmount: 1023,
            IsExpense: true,
            IsConfirmed: true,
            Frequency: TransactionFrequency.Unknown,
            CounterPartName: "Dinodime GmbH"
          }
        ]
      })
    } as unknown) as APIGatewayProxyEvent;

    await users.save(new User("chapu", "", ""));

    const result = await updateRecurrentTransactions(
      event,
      context,
      logger,
      dummyInterfaces.bankInterface,
      users,
      recurrentTransactions
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(204);
    expect(JSON.parse(result.body).message).to.include("updating recurrent transactions failed");
  });

  it("id recurrent transaction exist must success", async function() {
    const event = ({
      headers: {
        Authorization: "bearer 12345678"
      },
      body: JSON.stringify({
        recurrenttransactions: [
          {
            Id: 1,
            AccountId: 1,
            AbsAmount: 1023,
            IsExpense: true,
            IsConfirmed: true,
            Frequency: TransactionFrequency.Monthly,
            CounterPartName: "Dinodime GmbH"
          },
          {
            Id: 2,
            AccountId: 1,
            AbsAmount: 1024,
            IsExpense: true,
            IsConfirmed: true,
            Frequency: TransactionFrequency.Yearly,
            CounterPartName: "Dinodime GmbH 2"
          }
        ]
      })
    } as unknown) as APIGatewayProxyEvent;

    {
      let user = new User("chapu","","");
      user.isRecurrentTransactionConfirmed = false;
      await users.save(user);
    }
    await recurrentTransactions.saveArray([
      new RecurrentTransaction(1, [1, 2, 3], 1023, true, "Dinodime GmbH", 1),
      new RecurrentTransaction(1, [3, 4, 5], 1024, true, "Dinodime GmbH 2", 2)
    ]);

    const initialResult = await recurrentTransactions.findById(1);
    const initialResult2 = await recurrentTransactions.findById(2);
    expect(initialResult!.isConfirmed).to.equal(false, "tarnsaction with id 1 is confirmed");
    expect(initialResult2!.isConfirmed).to.equal(false, "tarnsaction with id 2 is confirmed");
    expect(initialResult!.frequency).to.equal(TransactionFrequency.Unknown);
    expect(initialResult2!.frequency).to.equal(TransactionFrequency.Unknown);

    const result = await updateRecurrentTransactions(
      event,
      context,
      logger,
      dummyInterfaces.bankInterface,
      users,
      recurrentTransactions
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(200);
    expect(JSON.parse(result.body).message).to.include("success");

    const modifiedResult = await recurrentTransactions.findById(1);
    const modifiedResult2 = await recurrentTransactions.findById(2);
    expect(modifiedResult!.isConfirmed).to.equal(true, "tarnsaction with id 1 is not confirmed");
    expect(modifiedResult2!.isConfirmed).to.equal(true, "tarnsaction with id 2 is not confirmed");
    expect(modifiedResult!.frequency).to.equal(TransactionFrequency.Monthly);
    expect(modifiedResult2!.frequency).to.equal(TransactionFrequency.Yearly);
    expect(modifiedResult!.absAmount).to.equal(1023);
    expect(modifiedResult2!.absAmount).to.equal(1024);

    {
      const user = await users.findById("chapu");
      expect(user!.isRecurrentTransactionConfirmed).to.equal(true);
    }
  });
});
