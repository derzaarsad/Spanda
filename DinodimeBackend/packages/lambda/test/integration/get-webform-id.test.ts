import chai from "chai";
const expect = chai.expect;
import winston from "winston";
import axios, { AxiosInstance } from "axios";

import { Context, APIGatewayProxyEvent } from "aws-lambda";
import { User, Users, VoidTransport, CallbackCrypto, Encryptions } from "dinodime-lib";

import { getWebformId } from "../../src/controllers/bank-controller";
import { CreateFinApiTestInterfaces } from "../test-utility";

import { Pool } from "pg";
import format from "pg-format";
import { UsersSchema } from "dinodime-lib";

describe("integration: get webform id", function() {
  this.timeout(10000); // Selenium browser takes so much time.

  let logger: winston.Logger;
  let users: Users.UsersRepository;
  let context: Context;
  let testUsername: string;
  let testPassword: string;
  let testValidEmail: string;
  let testValidPhone: string;
  let http: AxiosInstance;

  expect(process.env.AZURE_TEST_USER_LOGIN).to.exist;
  expect(process.env.FinAPIClientId).to.exist;
  expect(process.env.FinAPIClientSecret).to.exist;

  let dummyInterfaces = CreateFinApiTestInterfaces(
    process.env.FinAPIClientId!,
    process.env.FinAPIClientSecret!
  );
  let encryptions: Encryptions;

  this.beforeAll(async function() {
    http = axios.create({
      baseURL: "https://sandbox.finapi.io",
      timeout: 3000,
      headers: { Accept: "application/json" }
    });
  });

  beforeEach(async function() {
    testUsername = process.env.AZURE_TEST_USER_LOGIN!;
    testPassword = process.env.AZURE_TEST_USER_LOGIN!;
    testValidEmail = "chapu@chapu.com";
    testValidPhone = "+66 6666";

    logger = winston.createLogger({ transports: [new VoidTransport()] });

    users = new Users.PostgreSQLRepository(new Pool(), format, new UsersSchema());
    encryptions = new CallbackCrypto();

    context = {} as Context;
  });

  afterEach(async function() {
    await users.deleteAll();
  });

  it("rejects requests with failing authentication", async () => {
    await users.save(new User(testUsername, testValidEmail, testValidPhone, false));

    const event = ({
      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({ bankId: 277672 })
    } as unknown) as APIGatewayProxyEvent;

    const result = await getWebformId(
      event,
      context,
      logger,
      dummyInterfaces.bankInterface,
      users,
      encryptions
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(401);
  });

  it("rejects requests because user is not available", async () => {
    const authorization = await dummyInterfaces.authentication.getPasswordToken(
      dummyInterfaces.clientSecrets,
      testUsername,
      testPassword
    );

    const event = ({
      headers: {
        Authorization: authorization.token_type + " " + authorization.access_token,
        "Content-Type": "application/json"
      },

      body: JSON.stringify({ bankId: 277672 })
    } as unknown) as APIGatewayProxyEvent;

    const result = await getWebformId(
      event,
      context,
      logger,
      dummyInterfaces.bankInterface,
      users,
      encryptions
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(401);
  });

  it("rejects requests because user save failed", async () => {
    const authorization = await dummyInterfaces.authentication.getPasswordToken(
      dummyInterfaces.clientSecrets,
      testUsername,
      testPassword
    );

    const failingUsers = ({
      findById: async (id: string) => {
        return {
          username: testUsername
        };
      },

      save: async (user: User) => {
        throw "nada";
      }
    } as unknown) as Users.UsersRepository;

    const event = ({
      headers: {
        Authorization: authorization.token_type + " " + authorization.access_token,
        "Content-Type": "application/json"
      },

      body: JSON.stringify({ bankId: 277672 })
    } as unknown) as APIGatewayProxyEvent;

    const result = await getWebformId(
      event,
      context,
      logger,
      dummyInterfaces.bankInterface,
      failingUsers,
      encryptions
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(500);
  });

  it("return webform location", async function() {
    users.save(new User(testUsername, testValidEmail, testValidPhone, false));
    const authorization = await dummyInterfaces.authentication.getPasswordToken(
      dummyInterfaces.clientSecrets,
      testUsername,
      testPassword
    );

    const event = ({
      headers: {
        Authorization: authorization.token_type + " " + authorization.access_token,
        "Content-Type": "application/json"
      },

      body: JSON.stringify({ bankId: 277672 })
    } as unknown) as APIGatewayProxyEvent;

    const result = await getWebformId(
      event,
      context,
      logger,
      dummyInterfaces.bankInterface,
      users,
      encryptions
    );

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(200);
    expect(JSON.parse(result.body).location).to.be.an("string");
    expect(JSON.parse(result.body).webFormAuth).to.be.an("string");

    const location = JSON.parse(result.body).location as string;
    const slash = location.lastIndexOf("/");
    const token = location.substring(slash + 1);
    console.log(`location: ${location}; token: ${token}`);

    await http.post("/webForm", {
      webFormToken: token,
      agbVersion: "v1.3",
      changeCredentials: null,
      changeTwoStepProcedure: null,
      loginCredentials: [],
      storeSecrets: false,
      accountReferences: null,
      twoStepProcedureId: null,
      storeTwoStepProcedure: false,
      decoupledCallback: false,
      msaHash: null,
      msaChallengeResponse: null,
      sepaRequestChallengeResponse: null
    });

    //expect(JSON.parse(result.body).location).to.equal('testlocation');
    expect(JSON.parse(result.body).webFormAuth.split("-").length).to.equal(2);

    let formId = parseInt(JSON.parse(result.body).webFormAuth.split("-")[0]);
    let encryptedAuth = JSON.parse(result.body).webFormAuth.split("-")[1] as string;

    //expect(formId).to.equal('2934');
    expect(encryptedAuth).to.not.equal(event.headers.Authorization);

    // this test proves whether the right data is written to database
    let user = await users.findByWebFormId(formId);
    //expect(formId).to.equal(user.activeWebFormId);
    expect(
      encryptions.DecryptText({ iv: user!.activeWebFormAuth!, cipherText: encryptedAuth })
    ).to.equal(event.headers.Authorization);
  });
});
