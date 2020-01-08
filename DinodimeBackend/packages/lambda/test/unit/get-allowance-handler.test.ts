/* eslint-env node, mocha */
import winston from "winston";
import chai from "chai";
const expect = chai.expect;

import { getAllowance } from "../../src/controllers/bank-controller";
import { Context, APIGatewayProxyEvent } from "aws-lambda";
import { VoidTransport, FinAPI, Users, User } from "dynodime-lib";

describe("get allowance handler", function() {
  let logger: winston.Logger;
  let users: Users.UsersRepository;
  let context: Context;

  beforeEach(function() {
    logger = winston.createLogger({ transports: [new VoidTransport()] });
    users = new Users.InMemoryRepository();
    context = {} as Context;
  });

  it("rejects a request with missing authorization", async function() {
    const finapi = {} as FinAPI;

    const event = ({
      headers: {}
    } as unknown) as APIGatewayProxyEvent;

    const result = await getAllowance(event, context, logger, finapi, users);

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(401);
    expect(JSON.parse(result.body).message).to.include("unauthorized");
  });

  it("rejects a request with wrong authorization", async function() {
    const finapi = ({
      userInfo: async () => {
        throw "nada";
      }
    } as unknown) as FinAPI;

    const event = ({
      headers: {
        Authorization: "ok"
      }
    } as unknown) as APIGatewayProxyEvent;

    const result = await getAllowance(event, context, logger, finapi, users);

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(401);
    expect(JSON.parse(result.body).message).to.include("unauthorized");
  });

  it("rejects a request with missing user", async function() {
    const finapi = ({
      userInfo: async () => {
        return { id: "chapu" };
      }
    } as unknown) as FinAPI;

    const event = ({
      headers: {
        Authorization: "ok"
      }
    } as unknown) as APIGatewayProxyEvent;

    const result = await getAllowance(event, context, logger, finapi, users);

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(500);
    expect(JSON.parse(result.body).message).to.include("error fetching allowance");
  });

  it("gets the user allowance", async function() {
    const user = new User("chapu", "chapu@mischung.net", "666", false);
    user.allowance = 666;
    users.save(user);

    const finapi = ({
      userInfo: async () => {
        return { id: "chapu" };
      }
    } as unknown) as FinAPI;

    const event = ({
      headers: {
        Authorization: "ok"
      }
    } as unknown) as APIGatewayProxyEvent;

    const result = await getAllowance(event, context, logger, finapi, users);

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(200);
    expect(JSON.parse(result.body).allowance).to.equal(666);
  });
});
