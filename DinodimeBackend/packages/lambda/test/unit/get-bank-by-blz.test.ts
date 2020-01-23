/* eslint-env node, mocha */
import winston from "winston";
import chai from "chai";
const expect = chai.expect;

import { getBankByBLZ } from "../../src/controllers/bank-controller";
import { Context, APIGatewayProxyEvent } from "aws-lambda";
import {
  VoidTransport,
  FinAPI,
  Authentication,
  ClientSecretsProvider,
  Resolved
} from "dinodime-lib";

describe("get banks by BLZ handler", function() {
  let logger: winston.Logger;
  let context: Context;

  beforeEach(function() {
    logger = winston.createLogger({ transports: [new VoidTransport()] });
    context = {} as Context;
  });

  it("rejects a request with an invalid BLZ", async function() {
    const clientSecrets = {} as ClientSecretsProvider;
    const authentication = {} as Authentication;
    const finapi = {} as FinAPI;

    const event = ({
      pathParameters: {
        blz: "invalid"
      }
    } as unknown) as APIGatewayProxyEvent;

    const result = await getBankByBLZ(
      event,
      context,
      logger,
      clientSecrets,
      authentication,
      finapi
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(400);
    expect(JSON.parse(result.body).message).to.include("invalid");
  });

  it("rejects request with failing authorization", async function() {
    const clientSecrets = new Resolved("test-id", "test-secret");
    const finapi = {} as FinAPI;

    const authentication = ({
      getClientCredentialsToken: async () => {
        throw "nada";
      }
    } as unknown) as Authentication;

    const event = ({
      pathParameters: {
        blz: "00000000"
      }
    } as unknown) as APIGatewayProxyEvent;

    const result = await getBankByBLZ(
      event,
      context,
      logger,
      clientSecrets,
      authentication,
      finapi
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(401);
  });

  it("lists banks after fetching an authorization token", async function() {
    const clientSecrets = new Resolved("test-id", "test-secret");

    const authentication = ({
      getClientCredentialsToken: async () => {
        return {
          access_token: "test-token"
        };
      }
    } as unknown) as Authentication;

    const finapi = ({
      listBanksByBLZ: async () => {
        return [
          {
            bank: "test"
          }
        ];
      }
    } as unknown) as FinAPI;

    const event = ({
      pathParameters: {
        blz: "00000000"
      }
    } as unknown) as APIGatewayProxyEvent;

    const result = await getBankByBLZ(
      event,
      context,
      logger,
      clientSecrets,
      authentication,
      finapi
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(200);
  });
});
