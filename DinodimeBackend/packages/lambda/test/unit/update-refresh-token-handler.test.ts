/* eslint-env node, mocha */
import chai from "chai";
import winston from "winston";
import { updateRefreshToken } from "../../src/controllers/authentication-controller";
import { Context, APIGatewayProxyEvent } from "aws-lambda";
import { VoidTransport, Authentication, Resolved, ClientSecretsProvider, FinAPI } from "dinodime-lib";
import { Users, User } from "dinodime-lib";
import { CreateUnittestInterfaces } from "../test-utility";

const expect = chai.expect;

describe("unit: get refresh token handler", function() {
  let logger: winston.Logger;
  let clientSecrets: ClientSecretsProvider;
  let users: Users.UsersRepository;
  let context: Context;
  let dummyInterfaces = CreateUnittestInterfaces();

  beforeEach(function() {
    logger = winston.createLogger({ transports: [new VoidTransport()] });

    users = new Users.InMemoryRepository();

    clientSecrets = new Resolved("client-id", "client-secret");

    context = {} as Context;
  });

  it("rejects requests with missing parameters", async function() {
    await users.save(new User("chapu", "chapu@mischung.net", "+666 666 666", false));

    const event = {
      body: JSON.stringify({})
    };

    const result = await updateRefreshToken(
      event as APIGatewayProxyEvent,
      context,
      logger,
      clientSecrets,
      dummyInterfaces.authentication,
      dummyInterfaces.bankInterface,
      users
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(400);
  });

  it("rejects requests with failing authentication", async function() {
    await users.save(new User("chapu", "chapu@mischung.net", "+666 666 666", false));

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
      failingAuthentication,
      dummyInterfaces.bankInterface,
      users
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(401);
  });

  it("rejects requests with null token received", async function() {
    await users.save(new User("chapu", "chapu@mischung.net", "+666 666 666", false));

    const event = {
      body: JSON.stringify({ refresh_token: "secret" })
    };

    const failingAuthentication = ({
      getRefreshToken: async () => {}
    } as unknown) as Authentication;

    const result = await updateRefreshToken(
      event as APIGatewayProxyEvent,
      context,
      logger,
      clientSecrets,
      failingAuthentication,
      dummyInterfaces.bankInterface,
      users
    );

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

    const event = {
      body: JSON.stringify({ refresh_token: "secret" })
    };

    const result = await updateRefreshToken(
      event as APIGatewayProxyEvent,
      context,
      logger,
      clientSecrets,
      dummyInterfaces.authentication,
      failingBankInterface,
      users
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(401);
  });

  it("rejects with an internal error if user is not found in the database", async function() {
    const event = {
      body: JSON.stringify({ refresh_token: "secret" })
    };

    const result = await updateRefreshToken(
      event as APIGatewayProxyEvent,
      context,
      logger,
      clientSecrets,
      dummyInterfaces.authentication,
      dummyInterfaces.bankInterface,
      users
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(500);
  });

  it("obtains a refresh token", async function() {
    await users.save(new User("chapu", "chapu@mischung.net", "+666 666 666", false));

    const event = {
      body: JSON.stringify({ refresh_token: "secret" })
    };

    const result = await updateRefreshToken(
      event as APIGatewayProxyEvent,
      context,
      logger,
      clientSecrets,
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

    expect(body.token.refresh_token).to.equal("xyz_refreshtoken");
    expect(body.token.token_type).to.equal("bearer_refreshtoken");
    expect(body.token.scope).to.equal("test_refreshtoken");
    expect(body.token.access_token).to.equal("yyz_refreshtoken");

    expect(body.is_recurrent_transaction_confirmed).to.equal(true);
    expect(body.is_allowance_ready).to.equal(false);
  });
});
