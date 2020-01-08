/* eslint-env node, mocha */
import chai from "chai";
const expect = chai.expect;
import { authenticateAndSave } from "../../src/controllers/authentication-controller";
import { Context, APIGatewayProxyEvent } from "aws-lambda";
import winston from "winston";
import { VoidTransport, Authentication } from "dynodime-lib";
import { CreateUnittestInterfaces } from "../test-utility";

describe("authenticate user handler", function() {
  let logger: winston.Logger;
  let context: Context;
  let testUsername: string;
  let testPassword: string;

  let dummyInterfaces = CreateUnittestInterfaces();

  beforeEach(function() {
    testUsername = "chapu";
    testPassword = "secret";
    logger = winston.createLogger({ transports: [new VoidTransport()] });
    context = {} as Context;
  });

  it("rejects requests with missing parameters", async () => {
    const event = {
      body: JSON.stringify({ password: testPassword })
    };

    const result = await authenticateAndSave(
      event as APIGatewayProxyEvent,
      context,
      logger,
      dummyInterfaces.clientSecrets,
      dummyInterfaces.authentication
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(400);
  });

  it("rejects requests with failing authentication", async () => {
    const event = {
      body: JSON.stringify({ username: testUsername, password: testPassword })
    };

    const failingAuthentication = ({
      getPasswordToken: async () => {
        throw "nada";
      }
    } as unknown) as Authentication;

    const result = await authenticateAndSave(
      event as APIGatewayProxyEvent,
      context,
      logger,
      dummyInterfaces.clientSecrets,
      failingAuthentication
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(401);
  });

  it("obtains a password token", async () => {
    const event = {
      body: JSON.stringify({ username: testUsername, password: testPassword })
    };

    const result = await authenticateAndSave(
      event as APIGatewayProxyEvent,
      context,
      logger,
      dummyInterfaces.clientSecrets,
      dummyInterfaces.authentication
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(200);
    expect(JSON.parse(result.body).access_token).to.exist;
  });
});
