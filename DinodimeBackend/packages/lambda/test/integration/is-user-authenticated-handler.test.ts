/* eslint-env node, mocha */
import winston from "winston";
import chai from "chai";
const expect = chai.expect;

import { isUserAuthenticated } from "../../src/controllers/authentication-controller";
import { Context, APIGatewayProxyEvent } from "aws-lambda";
import { VoidTransport, FinAPI, Users, User } from "dinodime-lib";

import { Pool } from "pg";
import format from "pg-format";
import { UsersSchema } from "dinodime-lib";
import { CreateFinApiTestInterfaces } from "../test-utility";

describe("integration: isUserAuthenticated handler", function() {
  let logger: winston.Logger;
  let users: Users.UsersRepository;
  let context: Context;
  let testUsername: string;
  let testPassword: string;

  expect(process.env.AZURE_TEST_USER_LOGIN).to.exist;
  expect(process.env.FinAPIClientId).to.exist;
  expect(process.env.FinAPIClientSecret).to.exist;

  let dummyInterfaces = CreateFinApiTestInterfaces(
    process.env.FinAPIClientId!,
    process.env.FinAPIClientSecret!
  );

  beforeEach(async function() {
    testUsername = process.env.AZURE_TEST_USER_LOGIN!;
    testPassword = process.env.AZURE_TEST_USER_LOGIN!;

    logger = winston.createLogger({ transports: [new VoidTransport()] });

    users = new Users.PostgreSQLRepository(new Pool(), format, new UsersSchema());

    context = {} as Context;
  });

  afterEach(async function() {
    await users.deleteAll();
  });

  it("verifies an authorized request", async function() {
    await users.save(new User(testUsername, "chapu@mischung.net", "+666 666 666", false));

    const authorization = await dummyInterfaces.authentication.getPasswordToken(
        dummyInterfaces.clientSecrets,
        testUsername,
        testPassword
      );

    const event = ({
      headers: {
        Authorization: authorization.token_type + " " + authorization.access_token
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
    await users.save(new User(testUsername, "chapu@mischung.net", "+666 666 666", false));

    const event = ({ headers: {} } as unknown) as APIGatewayProxyEvent;
    const result = await isUserAuthenticated(event, context, logger, dummyInterfaces.bankInterface, users);

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(401);
  });

  it("rejects with unauthorized if userInfo throw an error", async function() {
    await users.save(new User(testUsername, "chapu@mischung.net", "+666 666 666", false));

    const event = ({
      headers: {
        Authorization: "bearer 5325626"
      }
    } as unknown) as APIGatewayProxyEvent;

    const result = await isUserAuthenticated(event, context, logger, dummyInterfaces.bankInterface, users);

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(401);
  });

  it("rejects with an internal error if user is not found in the database", async function() {
    
    const authorization = await dummyInterfaces.authentication.getPasswordToken(
        dummyInterfaces.clientSecrets,
        testUsername,
        testPassword
      );

    const event = ({
      headers: {
        Authorization: authorization.token_type + " " + authorization.access_token
      }
    } as unknown) as APIGatewayProxyEvent;

    const result = await isUserAuthenticated(event, context, logger, dummyInterfaces.bankInterface, users);

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(500);
  });
});
