/* eslint-env node, mocha */
import chai from "chai";
const expect = chai.expect;
import winston from "winston";

import { Context, APIGatewayProxyEvent } from "aws-lambda";
import { VoidTransport, Authentication } from "dinodime-lib";

import { updateRefreshToken } from "../../src/controllers/authentication-controller";
import { CreateFinApiTestInterfaces } from "../test-utility";

describe("integration: get refresh token handler", function() {
  let logger: winston.Logger;
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

  beforeEach(function() {
    testUsername = process.env.AZURE_TEST_USER_LOGIN!;
    testPassword = process.env.AZURE_TEST_USER_LOGIN!;

    logger = winston.createLogger({ transports: [new VoidTransport()] });

    context = {} as Context;
  });

  it("rejects requests with missing parameters", async function() {
    const event = {
      body: JSON.stringify({})
    };

    const result = await updateRefreshToken(
      event as APIGatewayProxyEvent,
      context,
      logger,
      dummyInterfaces.clientSecrets,
      dummyInterfaces.authentication
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(400);
  });

  it("rejects requests with failing authentication", async function() {
    const event = {
      body: JSON.stringify({ refresh_token: "secret" })
    };

    const failingAuthentication = ({
      getRefreshToken: async () => {
        throw "nada";
      }
    } as unknown) as Authentication;

    const result = await updateRefreshToken(
      event as APIGatewayProxyEvent,
      context,
      logger,
      dummyInterfaces.clientSecrets,
      failingAuthentication
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(401);
  });

  it("obtains a refresh token", async function() {
    const event = {
      body: JSON.stringify({ refresh_token: "secret" })
    };

    const result = await updateRefreshToken(
      event as APIGatewayProxyEvent,
      context,
      logger,
      dummyInterfaces.clientSecrets,
      dummyInterfaces.authentication
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(200);
    expect(JSON.parse(result.body).auth).to.equal(true);
  });
});
