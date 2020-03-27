/* eslint-env node, mocha */
import winston from "winston";
import chai from "chai";
const expect = chai.expect;

import { isUserAuthenticated } from "../../src/controllers/authentication-controller";
import { Context, APIGatewayProxyEvent } from "aws-lambda";
import { VoidTransport, FinAPI } from "dinodime-lib";

describe("unit: isUserAuthenticated handler", function() {
  let logger: winston.Logger;
  let context: Context;

  beforeEach(function() {
    logger = winston.createLogger({ transports: [new VoidTransport()] });
    context = {} as Context;
  });

  it("verifies an authorized request", async function() {
    const bankInterface = ({
      userInfo: async () => {
        return "ok";
      }
    } as unknown) as FinAPI;

    const event = ({
      headers: {
        Authorization: "bearer 5325626"
      }
    } as unknown) as APIGatewayProxyEvent;

    const result = await isUserAuthenticated(event, context, logger, bankInterface);

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(200);
    expect(result.body).to.be.an("string");
    expect(result.body).to.equal(JSON.stringify("ok"));
  });

  it("rejects an unauthorized request", async function() {
    const bankInterface = ({
      userInfo: async () => {
        return "ok";
      }
    } as unknown) as FinAPI;

    const event = ({ headers: {} } as unknown) as APIGatewayProxyEvent;
    const result = await isUserAuthenticated(event, context, logger, bankInterface);

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(401);
  });
});
