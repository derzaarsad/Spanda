import chai from "chai";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import winston from "winston";

import AWS from "aws-sdk";
import SQS from "aws-sdk/clients/sqs";

import { User, Transaction, CallbackCrypto, EncryptedData } from "dinodime-lib";

const assert = chai.assert;
const expect = chai.expect;

const env = process.env;

const callbackUrl = env["CALLBACK_ENDPOINT_URL"] as string;
const adminEndpointUrl = env["ADMIN_ENDPOINT_URL"] as string;

AWS.config.update({ region: process.env.CDK_DEPLOY_REGION });

describe("integration: web form callback", function () {
  this.timeout(20000);

  let authenticatedSecret: EncryptedData;
  let logger: winston.Logger;
  let http: AxiosInstance;
  let sqs: SQS;

  before(function () {
    const crypto = new CallbackCrypto();
    authenticatedSecret = crypto.EncryptText("Bearer abc.def.xyz");

    logger = winston.createLogger({
      level: "debug",
      transports: [
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      ],
    });

    sqs = new SQS();

    http = axios.create({
      timeout: 5000,
      headers: { Accept: "application/json" },
    });
  });

  it("imports the bank connections when the user is authenticated", async () => {
    logger.info("publishing webform completion...");
    const callbackResponse = await http.get(`${callbackUrl}/webForms/callback/666-${authenticatedSecret.cipherText}`);
    expect(callbackResponse).to.be.an("object");
    expect(callbackResponse.status).to.equal(202);

    logger.info("fetching transactions...");
    await timeout(10);
    const transactions = await getUserTransactions();
    expect(transactions).to.not.be.empty;
  });

  beforeEach(async function () {
    const user = new User("demo", "demo@localhost.de", "+49 99 999999-999", true);
    user.activeWebFormAuth = authenticatedSecret.iv;
    user.activeWebFormId = 666;
    const data = user;

    logger.info("creating demo user...");
    await axios.post(`${adminEndpointUrl}/users`, data);
    logger.info("demo user created successfully");
  });

  afterEach(async function () {
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: "Bearer abc.def.xyz",
      },
    };
    logger.info("deleting bank data...");
    await axios.delete(`${adminEndpointUrl}/data`, config);
    logger.info("demo user data deleted successfully");

    logger.info("deleting demo user...");
    await axios.delete(`${adminEndpointUrl}/users`, config);
    logger.info("demo user deleted successfully");
  });

  async function getUserTransactions(): Promise<Transaction[]> {
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: "Bearer abc.def.xyz",
      },
    };
    return await axios.get(`${adminEndpointUrl}/data`, config);
  }

  function timeout(s: number) {
    return new Promise((resolve) => setTimeout(resolve, s * 1000));
  }
});
