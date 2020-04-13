import SNS from "aws-sdk/clients/sns";
import DynamoDB from "aws-sdk/clients/dynamodb";
import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import winston from "winston";

import { CreateSimpleResponse } from "./lambda-util";

import { Notification, EncryptedNewTransactionsNotification } from "dinodime-lib";
import { AesCrypto } from "dinodime-lib";
import { NewTransactionsDecryptor } from "dinodime-lib";
import { AWSSNSPublisher } from "dinodime-lib";
import { NewTransactionsSNSPublisher } from "dinodime-lib";
import { DynamoDBRuleHandleRepository } from "dinodime-lib";

const env = process.env;
const errorMessage = "error processing notification";

const logger = winston.createLogger({
  level: env["LOGGER_LEVEL"] || "debug",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.json()
    })
  ]
});

const decryptionKey = env["DECRYPTION_KEY"] as string;
const tableName = env["TABLE_NAME"] as string;
const topicArn = env["TOPIC_ARN"] as string;

const crypto = new AesCrypto(decryptionKey);
const snsPublisher = new AWSSNSPublisher(new SNS());
const decoder = new NewTransactionsDecryptor(crypto);
const ruleHandlesRepository = new DynamoDBRuleHandleRepository(new DynamoDB(), tableName);
const callback = new NewTransactionsSNSPublisher(
  decoder,
  ruleHandlesRepository,
  snsPublisher,
  topicArn,
  logger
);

function isNewTransactionsNotification(
  eventBody: any | null
): eventBody is EncryptedNewTransactionsNotification {
  if (eventBody === null) {
    return false;
  }

  const notification = eventBody as Notification;

  return (
    notification.notificationRuleId !== undefined &&
    notification.callbackHandle !== undefined &&
    notification.triggerEvent === "NEW_TRANSACTIONS"
  );
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod !== "POST") {
    return CreateSimpleResponse(405, "method not allowed");
  }

  logger.debug("received event", event);

  const eventBody = event.body;
  const body = eventBody ? JSON.parse(eventBody) : null;

  if (isNewTransactionsNotification(body)) {
    try {
      const status = await callback.accept(body);
      if (status.kind === "success") {
        return CreateSimpleResponse(201, "notification processed successfully");
      } else {
        logger.error(errorMessage, status.error);
        return CreateSimpleResponse(500, errorMessage);
      }
    } catch (err) {
      logger.error(errorMessage, err);
      return CreateSimpleResponse(500, errorMessage);
    }
  } else {
    return CreateSimpleResponse(400, "received an invalid notification");
  }
};
