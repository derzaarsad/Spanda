/* eslint-env node, mocha */
import winston from "winston";
import chai from "chai";
const expect = chai.expect;

import { updateRecurrentTransactions } from "../../src/controllers/bank-controller";
import { Context, APIGatewayProxyEvent } from "aws-lambda";
import { VoidTransport, FinAPI } from "dinodime-lib";
import { Users, User } from "dinodime-lib";
import { RecurrentTransactions, RecurrentTransaction, TransactionFrequency } from "dinodime-lib";

describe("unit: update recurrent transactions", function() {
  let logger: winston.Logger;
  let recurrentTransactions: RecurrentTransactions.RecurrentTransactionsRepository;
  let users: Users.UsersRepository;
  let context: Context;

  beforeEach(function() {
    logger = winston.createLogger({ transports: [new VoidTransport()] });

    recurrentTransactions = new RecurrentTransactions.InMemoryRepository();
    users = new Users.InMemoryRepository();

    context = {} as Context;
  });

  it("no auth must fail", async function() {
    const finapi = ({
      userInfo: async () => {
        return { id: "chapu" };
      }
    } as unknown) as FinAPI;

    const event = ({
      headers: {},
      body: JSON.stringify({})
    } as unknown) as APIGatewayProxyEvent;

    const result = await updateRecurrentTransactions(event, context, logger, finapi, users, recurrentTransactions);

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(401);
    expect(JSON.parse(result.body).message).to.include("unauthorized");
  });

  it("no user must fail", async function() {
    const finapi = ({
      userInfo: async () => {
        return { id: "chapu" };
      }
    } as unknown) as FinAPI;

    const event = ({
      headers: {
        Authorization: "bearer 12345678"
      },
      body: JSON.stringify({})
    } as unknown) as APIGatewayProxyEvent;

    const result = await updateRecurrentTransactions(event, context, logger, finapi, users, recurrentTransactions);

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(401);
    expect(JSON.parse(result.body).message).to.include("unauthorized");
  });

  it("no body must fail", async function() {
    const finapi = ({
      userInfo: async () => {
        return { id: "chapu" };
      }
    } as unknown) as FinAPI;

    const event = ({
      headers: {
        Authorization: "bearer 12345678"
      }
    } as unknown) as APIGatewayProxyEvent;

    await users.save(new User("chapu", "", ""));

    const result = await updateRecurrentTransactions(event, context, logger, finapi, users, recurrentTransactions);

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(400);
    expect(JSON.parse(result.body).message).to.include("empty body");
  });

  it("no recurrenttransactions in the body must fail", async function() {
    const finapi = ({
      userInfo: async () => {
        return { id: "chapu" };
      }
    } as unknown) as FinAPI;

    const event = ({
      headers: {
        Authorization: "bearer 12345678"
      },
      body: JSON.stringify({})
    } as unknown) as APIGatewayProxyEvent;

    await users.save(new User("chapu", "", ""));

    const result = await updateRecurrentTransactions(event, context, logger, finapi, users, recurrentTransactions);

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(400);
    expect(JSON.parse(result.body).message).to.include("invalid request");
  });

  it("if updateArray failed must fail", async function() {
    const finapi = ({
      userInfo: async () => {
        return { id: "chapu" };
      }
    } as unknown) as FinAPI;

    const event = ({
      headers: {
        Authorization: "bearer 12345678"
      },
      body: JSON.stringify({
        recurrenttransactions: [
          {
            Id: 1,
            AccountId: 1,
            IsExpense: true,
            IsConfirmed: true,
            Frequency: TransactionFrequency.Unknown,
            CounterPartName: "Dinodime GmbH"
          }
        ]
      })
    } as unknown) as APIGatewayProxyEvent;

    await users.save(new User("chapu", "", ""));

    const result = await updateRecurrentTransactions(event, context, logger, finapi, users, recurrentTransactions);

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(204);
    expect(JSON.parse(result.body).message).to.include("updating recurrent transactions failed");
  });

  it("id recurrent transaction exist must success", async function() {
    const finapi = ({
      userInfo: async () => {
        return { id: "chapu" };
      }
    } as unknown) as FinAPI;

    const event = ({
      headers: {
        Authorization: "bearer 12345678"
      },
      body: JSON.stringify({
        recurrenttransactions: [
          {
            Id: 1,
            AccountId: 1,
            IsExpense: true,
            IsConfirmed: true,
            Frequency: TransactionFrequency.Monthly,
            CounterPartName: "Dinodime GmbH"
          },
          {
            Id: 2,
            AccountId: 1,
            IsExpense: true,
            IsConfirmed: true,
            Frequency: TransactionFrequency.Yearly,
            CounterPartName: "Dinodime GmbH 2"
          }
        ]
      })
    } as unknown) as APIGatewayProxyEvent;

    {
      let user = new User("chapu", "", "");
      user.isRecurrentTransactionConfirmed = false;
      await users.save(user);
    }
    await recurrentTransactions.saveArray([
      new RecurrentTransaction(1, [1, 2, 3], true, "Dinodime GmbH", 1),
      new RecurrentTransaction(1, [3, 4, 5], true, "Dinodime GmbH 2", 2)
    ]);

    const initialResult = await recurrentTransactions.findById(1);
    const initialResult2 = await recurrentTransactions.findById(2);
    expect(initialResult!.isConfirmed).to.equal(false);
    expect(initialResult2!.isConfirmed).to.equal(false);
    expect(initialResult!.frequency).to.equal(TransactionFrequency.Unknown);
    expect(initialResult2!.frequency).to.equal(TransactionFrequency.Unknown);

    const result = await updateRecurrentTransactions(event, context, logger, finapi, users, recurrentTransactions);

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(200);
    expect(JSON.parse(result.body).message).to.include("success");

    const modifiedResult = await recurrentTransactions.findById(1);
    const modifiedResult2 = await recurrentTransactions.findById(2);
    expect(modifiedResult!.isConfirmed).to.equal(true);
    expect(modifiedResult2!.isConfirmed).to.equal(true);
    expect(modifiedResult!.frequency).to.equal(TransactionFrequency.Monthly);
    expect(modifiedResult2!.frequency).to.equal(TransactionFrequency.Yearly);

    {
      const user = await users.findById("chapu");
      expect(user!.isRecurrentTransactionConfirmed).to.equal(true);
    }
  });
});
