import chai from "chai";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import winston from "winston";

import AWS from "aws-sdk";
import SQS, { MessageList } from "aws-sdk/clients/sqs";

import { deleteMessages } from "./util";

const assert = chai.assert;
const expect = chai.expect;

const env = process.env;

const endpointUrl = env["ENDPOINT_URL"] as string;
const queueUrl = env["QUEUE_URL"] as string;
const dlqUrl = env["DLQ_URL"] as string;
const adminEndpointUrl = env["ADMIN_URL"] as string;

AWS.config.update({ region: process.env.CDK_DEPLOY_REGION });

describe("integration: web form callback", function() {
  this.timeout(20000);

  let logger: winston.Logger;
  let http: AxiosInstance;
  let sqs: SQS;

  before(function() {
    logger = winston.createLogger({
      level: "debug",
      transports: [
        new winston.transports.Console({
          format: winston.format.simple()
        })
      ]
    });

    sqs = new SQS();

    http = axios.create({
      timeout: 3000,
      headers: { Accept: "application/json" }
    });
  });

  it("imports the bank connections when the user is authenticated", async () => {
    const callbackResponse = await http.get(`${endpointUrl}/webForms/callback?webFormAuth=666-covfefe`);
    expect(callbackResponse).to.be.an("object");
    expect(callbackResponse.status).to.equal(202);

    const messages: MessageList | undefined = await sqs
      .receiveMessage({ QueueUrl: queueUrl, AttributeNames: ["All"], WaitTimeSeconds: 5, MaxNumberOfMessages: 1 })
      .promise()
      .then(result => {
        return result.Messages;
      });

    logger.info("Received messages", messages);
    if (!messages) {
      logger.info(`Skipped deleting messages`);
    } else {
      logger.info(`Deleting ${messages.length} message(s) from queue ${queueUrl}`);
      await deleteMessages(sqs, queueUrl, messages);
    }

    expect(messages).to.be.ok;
    expect(messages!.length).to.be.empty;
  });
  
  beforeEach(async function() {
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: "Bearer abc.def.xyz"
      }
    };
    await axios.delete(`${adminEndpointUrl}/data`, config);
  });

  afterEach(async function() {
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: "Bearer abc.def.xyz"
      }
    };
    await axios.delete(`${adminEndpointUrl}/data`, config);
  });
});
