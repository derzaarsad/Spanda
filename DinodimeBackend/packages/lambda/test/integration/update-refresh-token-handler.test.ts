/* eslint-env node, mocha */
import chai from "chai";
const expect = chai.expect;
import { updateRefreshToken } from "../../src/controllers/authentication-controller";
import { Context, APIGatewayProxyEvent } from "aws-lambda";
import winston from "winston";
import { VoidTransport, Authentication, FinAPI } from "dinodime-lib";
import { Users, User } from "dinodime-lib";

import { Pool } from "pg";
import format from "pg-format";
import { UsersSchema } from "dinodime-lib";
import { CreateFinApiTestInterfaces } from "../test-utility";

describe("integration: get refresh token handler", function() {
  let logger: winston.Logger;
  let users: Users.UsersRepository;
  let context: Context;
  let testUsername: string;
  let testPassword: string;

  expect(process.env.AZURE_TEST_USER_UPDATEREFRESH).to.exist;
  expect(process.env.FinAPIClientId).to.exist;
  expect(process.env.FinAPIClientSecret).to.exist;

  let dummyInterfaces = CreateFinApiTestInterfaces(
    process.env.FinAPIClientId!,
    process.env.FinAPIClientSecret!
  );

  beforeEach(async function() {
    testUsername = process.env.AZURE_TEST_USER_UPDATEREFRESH!;
    testPassword = process.env.AZURE_TEST_USER_UPDATEREFRESH!;

    logger = winston.createLogger({ transports: [new VoidTransport()] });

    users = new Users.PostgreSQLRepository(new Pool(), format, new UsersSchema());

    context = {} as Context;
  });

  afterEach(async function() {
    await users.deleteAll();
  });

  it("rejects requests with missing parameters", async function() {
    await users.save(new User(testUsername, "chapu@mischung.net", "+666 666 666", false));

    const event = {
      body: JSON.stringify({})
    };

    const result = await updateRefreshToken(
      event as APIGatewayProxyEvent,
      context,
      logger,
      dummyInterfaces.clientSecrets,
      dummyInterfaces.authentication,
      dummyInterfaces.bankInterface,
      users
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(400);
  });

  it("rejects requests with failing authentication", async function() {
    await users.save(new User(testUsername, "chapu@mischung.net", "+666 666 666", false));

    const event = {
      body: JSON.stringify({ refresh_token: "secret" })
    };

    const result = await updateRefreshToken(
      event as APIGatewayProxyEvent,
      context,
      logger,
      dummyInterfaces.clientSecrets,
      dummyInterfaces.authentication,
      dummyInterfaces.bankInterface,
      users
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(401);
  });

  it("rejects with an internal error if user is not found in the database", async function() {

    const authorization = await dummyInterfaces.authentication.getPasswordToken(
        dummyInterfaces.clientSecrets,
        testUsername,
        testPassword
      );

    const event = {
      body: JSON.stringify({ refresh_token: authorization.refresh_token })
    };

    const result = await updateRefreshToken(
      event as APIGatewayProxyEvent,
      context,
      logger,
      dummyInterfaces.clientSecrets,
      dummyInterfaces.authentication,
      dummyInterfaces.bankInterface,
      users
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(500);
  });

  it("obtains a refresh token", async function() {
    await users.save(new User(testUsername, "chapu@mischung.net", "+666 666 666", false));

    const authorization = await dummyInterfaces.authentication.getPasswordToken(
        dummyInterfaces.clientSecrets,
        testUsername,
        testPassword
      );

    const event = {
      body: JSON.stringify({ refresh_token: authorization.refresh_token })
    };

    const result = await updateRefreshToken(
      event as APIGatewayProxyEvent,
      context,
      logger,
      dummyInterfaces.clientSecrets,
      dummyInterfaces.authentication,
      dummyInterfaces.bankInterface,
      users
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(200);

    const body = JSON.parse(result.body);
    expect(body.token).to.exist;
    expect(body.is_recurrent_transaction_confirmed).to.exist;
    expect(body.is_allowance_ready).to.exist;

    // Because the testUsername account is freshly made, we can assume that its refresh token is still valid.
    expect(body.token.refresh_token).to.equal(authorization.refresh_token);
    expect(body.token.token_type).to.equal(authorization.token_type);
    expect(body.token.scope).to.equal(authorization.scope);

    expect(body.is_recurrent_transaction_confirmed).to.equal(true);
    expect(body.is_allowance_ready).to.equal(false);
  });
});
