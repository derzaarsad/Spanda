import SQS from "aws-sdk/clients/sqs";
import { APIGatewayProxyEvent, Context, APIGatewayProxyResult, SQSEvent } from "aws-lambda";
import { ServiceProvider } from "./service-provider";
import { AWSSQSPublisher, AWSSQSClient } from "dinodime-lib";
import { WebFormCallbackHandlerConfiguration, webFormCallbackHandler } from "./webform-callback-handler";
import { FetchWebFormHandlerConfiguration, fetchWebFormHandler } from "./webform-callback-handler";

const env = process.env;
const services = new ServiceProvider(env);
const queueUrl = env["QUEUE_URL"] as string;
const sqsPublisher = new AWSSQSPublisher(new SQS(), queueUrl);
const sqsClient = new AWSSQSClient(new SQS(), queueUrl);
const logger = services.logger;

const callbackHandlerConfiguration = {
  log: services.logger,
  users: services.users,
  sqs: sqsPublisher,
};

const fetchWebFormHandlerConfiguration: FetchWebFormHandlerConfiguration = {
  log: services.logger,
  users: services.users,
  sqs: sqsClient,
  connections: services.connections,
  transactions: services.transactions,
  bankInterface: services.bankInterface,
  encryptions: services.encryptions,
};

export const webFormCallback = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  logger.debug("Received event", event);
  const response = await webFormCallbackHandler(event, context, callbackHandlerConfiguration);
  logger.debug("Responding with", response);
  return response;
};

export const fetchWebForm = async (event: SQSEvent, context: Context) => {
  logger.debug("Received event", event);
  const response = await fetchWebFormHandler(event, context, fetchWebFormHandlerConfiguration);
  logger.debug("Responding with", response);
  return response;
};
