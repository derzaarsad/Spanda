/* eslint-env node, mocha */
import winston from "winston";
import chai from "chai";
const expect = chai.expect;

import { isUserAuthenticated } from "../../src/controllers/authentication-controller";
import { Context, APIGatewayProxyEvent } from "aws-lambda";
import { VoidTransport, FinAPI, Users, User } from "dinodime-lib";
import { CreateUnittestInterfaces } from "../test-utility";

describe("unit: isUserAuthenticated handler", function() {
  let logger: winston.Logger;
  let users: Users.UsersRepository;
  let context: Context;
  let dummyInterfaces = CreateUnittestInterfaces();

  beforeEach(function() {
    logger = winston.createLogger({ transports: [new VoidTransport()] });

    users = new Users.InMemoryRepository();

    context = {} as Context;
  });

  it("verifies an authorized request", async function() {
    await users.save(new User("chapu", "chapu@mischung.net", "+666 666 666", false));

    const event = ({
      headers: {
        Authorization: "bearer 5325626"
      }
    } as unknown) as APIGatewayProxyEvent;

    const result = await isUserAuthenticated(event, context, logger, dummyInterfaces.bankInterface, users);

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(200);
    expect(result.body).to.be.an("string");

    const body = JSON.parse(result.body);
    expect(body.is_recurrent_transaction_confirmed).to.exist;
    expect(body.is_allowance_ready).to.exist;
    expect(body.is_recurrent_transaction_confirmed).to.equal(true);
    expect(body.is_allowance_ready).to.equal(false);
  });

  it("rejects an unauthorized request", async function() {
    await users.save(new User("chapu", "chapu@mischung.net", "+666 666 666", false));

    const event = ({ headers: {} } as unknown) as APIGatewayProxyEvent;
    const result = await isUserAuthenticated(event, context, logger, dummyInterfaces.bankInterface, users);

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(401);
  });

  it("rejects with unauthorized if userInfo throw an error", async function() {
    await users.save(new User("chapu", "chapu@mischung.net", "+666 666 666", false));

    const failingBankInterface = ({
      userInfo: async () => {
        throw "nada";
      }
    } as unknown) as FinAPI;

    const event = ({
      headers: {
        Authorization: "bearer 5325626"
      }
    } as unknown) as APIGatewayProxyEvent;

    const result = await isUserAuthenticated(event, context, logger, failingBankInterface, users);

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(401);
  });

  it("rejects with an internal error if user is not found in the database", async function() {

    const event = ({
      headers: {
        Authorization: "bearer 5325626"
      }
    } as unknown) as APIGatewayProxyEvent;

    const result = await isUserAuthenticated(event, context, logger, dummyInterfaces.bankInterface, users);

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(500);
  });
});
