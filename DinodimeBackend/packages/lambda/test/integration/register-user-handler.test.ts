import chai from "chai";
const expect = chai.expect;
import winston from "winston";
import { Context, APIGatewayProxyEvent } from "aws-lambda";
import { User, Users, VoidTransport, Authentication } from "dinodime-lib";

import { registerUser } from "../../src/controllers/authentication-controller";
import { CreateFinApiTestInterfaces } from "../test-utility";

import { Pool } from "pg";
import format from "pg-format";
import { UsersSchema } from "dinodime-lib";

describe("integration: register user handler", function() {
  let logger: winston.Logger;
  let users: Users.UsersRepository;
  let context: Context;
  let testUsername: string;
  let testPassword: string;
  let testValidEmail: string;
  let testInvalidEmail: string;
  let testValidPhone: string;
  let testInvalidPhone: string;

  expect(process.env.AZURE_TEST_USER_REGISTER).to.exist;
  expect(process.env.FinAPIClientId).to.exist;
  expect(process.env.FinAPIClientSecret).to.exist;

  let dummyInterfaces = CreateFinApiTestInterfaces(
    process.env.FinAPIClientId!,
    process.env.FinAPIClientSecret!
  );

  beforeEach(async function() {
    testUsername = process.env.AZURE_TEST_USER_REGISTER!;
    testPassword = "secret";
    testValidEmail = "chapu@mischung.net";
    testInvalidEmail = "chapu@chapu";
    testValidPhone = "+66 66 6666";
    testInvalidPhone = "invalid";

    logger = winston.createLogger({ transports: [new VoidTransport()] });

    users = new Users.PostgreSQLRepository(new Pool(), format, new UsersSchema());
    context = {} as Context;
  });

  afterEach(async function() {
    await users.deleteAll();
  });

  it("rejects a request with missing attributes", async () => {
    const user = { id: testUsername };

    const event = ({
      headers: {},
      body: JSON.stringify(user)
    } as unknown) as APIGatewayProxyEvent;

    const result = await registerUser(
      event,
      context,
      logger,
      dummyInterfaces.clientSecrets,
      dummyInterfaces.authentication,
      dummyInterfaces.bankInterface,
      users
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(400);
    expect(JSON.parse(result.body).message).to.include("request body is incomplete");
  });

  it("rejects a request with invalid email", async () => {
    const user = {
      id: testUsername,
      password: testPassword,
      email: testInvalidEmail,
      phone: testValidPhone,
      isAutoUpdateEnabled: true
    };

    const event = ({
      headers: {},
      body: JSON.stringify(user)
    } as unknown) as APIGatewayProxyEvent;

    const result = await registerUser(
      event,
      context,
      logger,
      dummyInterfaces.clientSecrets,
      dummyInterfaces.authentication,
      dummyInterfaces.bankInterface,
      users
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(400);
    expect(JSON.parse(result.body).message).to.include("invalid email");
  });

  it("rejects a request with invalid phone", async () => {
    const user = {
      id: testUsername,
      password: testPassword,
      email: testValidEmail,
      phone: testInvalidPhone,
      isAutoUpdateEnabled: true
    };

    const event = ({
      headers: {},
      body: JSON.stringify(user)
    } as unknown) as APIGatewayProxyEvent;

    const result = await registerUser(
      event,
      context,
      logger,
      dummyInterfaces.clientSecrets,
      dummyInterfaces.authentication,
      dummyInterfaces.bankInterface,
      users
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(400);
    expect(JSON.parse(result.body).message).to.include("invalid phone");
  });

  it("rejects a request failing authorization", async () => {
    const user = {
      id: testUsername,
      password: testPassword,
      email: testValidEmail,
      phone: testValidPhone,
      isAutoUpdateEnabled: true
    };

    const failingAuthentication = ({
      getClientCredentialsToken: async () => {
        throw "nada";
      }
    } as unknown) as Authentication;

    const event = ({
      headers: {},
      body: JSON.stringify(user)
    } as unknown) as APIGatewayProxyEvent;

    const result = await registerUser(
      event,
      context,
      logger,
      dummyInterfaces.clientSecrets,
      failingAuthentication,
      dummyInterfaces.bankInterface,
      users
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(401);
  });

  it("rejects a request with with existing user", async () => {
    users.save(new User(testUsername, testValidEmail, testValidPhone, false));

    const user = {
      id: testUsername,
      password: testPassword,
      email: testValidEmail,
      phone: testValidPhone,
      isAutoUpdateEnabled: true
    };

    const event = ({
      headers: {},
      body: JSON.stringify(user)
    } as unknown) as APIGatewayProxyEvent;

    const result = await registerUser(
      event,
      context,
      logger,
      dummyInterfaces.clientSecrets,
      dummyInterfaces.authentication,
      dummyInterfaces.bankInterface,
      users
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(409);
  });

  it("adds a new user to the repository", async () => {
    const user = {
      id: testUsername,
      password: testPassword,
      email: testValidEmail,
      phone: testValidPhone,
      isAutoUpdateEnabled: true
    };

    const event = ({
      headers: {},
      body: JSON.stringify(user)
    } as unknown) as APIGatewayProxyEvent;

    const result = await registerUser(
      event,
      context,
      logger,
      dummyInterfaces.clientSecrets,
      dummyInterfaces.authentication,
      dummyInterfaces.bankInterface,
      users
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(201, "expected status code created");

    const newUser = await users.findById(testUsername);
    expect(newUser, "expected the user to have been persisted").to.be.ok;
    expect(newUser).to.be.an("object");
  });
});
