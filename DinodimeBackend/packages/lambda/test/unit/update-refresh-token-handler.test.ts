/* eslint-env node, mocha */
import chai from "chai";
const expect = chai.expect;
import { updateRefreshToken } from "../../src/controllers/authentication-controller";
import { Context, APIGatewayProxyEvent } from "aws-lambda";
import winston from "winston";
import { VoidTransport, Authentication, Resolved, ClientSecretsProvider } from "dinodime-lib";
import { CreateUnittestInterfaces } from "../test-utility";

describe("get refresh token handler", function() {
  let logger: winston.Logger;
  let clientSecrets: ClientSecretsProvider;
  let authentication: Authentication;
  let context: Context;

  beforeEach(function() {
    logger = winston.createLogger({ transports: [new VoidTransport()] });

    clientSecrets = new Resolved("client-id", "client-secret");
    authentication = ({
      getRefreshToken: async () => {
        return {
          auth: true
        };
      }
    } as unknown) as Authentication;

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
      clientSecrets,
      authentication
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
      clientSecrets,
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
      clientSecrets,
      authentication
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(200);
    expect(JSON.parse(result.body).auth).to.equal(true);
  });
});
