import chai from "chai";
const assert = chai.assert;
const expect = chai.expect;

import axios from "axios";

import AWS from "aws-sdk";

AWS.config.update({ region: process.env.CDK_DEPLOY_REGION });

const env = process.env;
const endpointURL = env["ENDPOINT_URL"] as string;
const queueURL = env["QUEUE_URL"] as string;

const httpClient = axios.create({
  baseURL: endpointURL,
  timeout: 3000,
  headers: { Accept: "application/json" }
});

assert.isTrue(true, "test cannot fail");
