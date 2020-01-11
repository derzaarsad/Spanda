/* eslint-env node, mocha */
import winston from "winston";
import chai from "chai";
const expect = chai.expect;

import { getWebformId } from "../../src/controllers/bank-controller";
import { Context, APIGatewayProxyEvent } from "aws-lambda";
import { VoidTransport, Users, User } from "dynodime-lib";
import { CreateUnittestInterfaces } from "../test-utility";
import { Encryptions, CallbackCrypto } from "dynodime-lib";

describe("get webform id", function() {
  let logger: winston.Logger;
  let users: Users.UsersRepository;
  let context: Context;
  let testUsername: string;
  let testValidEmail: string;
  let testValidPhone: string;

  let dummyInterfaces = CreateUnittestInterfaces();
  let encryptions: Encryptions;

  beforeEach(function() {
    testUsername = "chapu";
    testValidEmail = "chapu@chapu.com";
    testValidPhone = "+66 6666";

    logger = winston.createLogger({ transports: [new VoidTransport()] });

    users = new Users.InMemoryRepository();

    context = {} as Context;
    encryptions = new CallbackCrypto();
  });

  it("rejects requests with failing authentication", async () => {
    await users.save(new User(testUsername, testValidEmail, testValidPhone, false));

    const event = ({
      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({ bankId: 123545 })
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
    const event = ({
      headers: {
        Authorization: "bearer 12345678",
        "Content-Type": "application/json"
      },

      body: JSON.stringify({ bankId: 123545 })
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
    const failingUsers = ({
      findById: async () => {
        return {
          username: testUsername
        };
      },

      save: async () => {
        throw "nada";
      }
    } as unknown) as Users.UsersRepository;

    const event = ({
      headers: {
        Authorization: "bearer 12345678",
        "Content-Type": "application/json"
      },

      body: JSON.stringify({ bankId: 123545 })
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
    await users.save(new User(testUsername, testValidEmail, testValidPhone, false));

    const event = ({
      headers: {
        Authorization: "bearer 12345678",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ bankId: 123545 })
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

    const body = JSON.parse(result.body);
    expect(body.location).to.be.a("string");
    expect(body.webFormAuth).to.be.a("string");
    expect(body.location).to.equal("testlocation");
    expect(body.webFormAuth.split("-").length).to.equal(2);

    let formId = body.webFormAuth.split("-")[0];
    let encryptedAuth = body.webFormAuth.split("-")[1];

    expect(formId).to.equal("2934");
    expect(encryptedAuth).to.not.equal(event.headers.Authorization);

    // this test proves whether the right data is written to database
    let user = await users.findByWebFormAuth("2934");
    expect(formId).to.equal(user!.activeWebFormId!);
    expect(
      encryptions.DecryptText({ iv: user!.activeWebFormAuth!, cipherText: encryptedAuth })
    ).to.equal(event.headers.Authorization);
  });
});
