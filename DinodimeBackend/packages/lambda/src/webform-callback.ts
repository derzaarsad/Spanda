import SQS from "aws-sdk/clients/sqs";
import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { AWSSQSPublisher } from "dinodime-lib";
import { ServiceProvider } from "./service-provider";
import { HandlerConfiguration, webformCallback } from "./webform-callback-handler";

const env = process.env;
const services = new ServiceProvider(env);
const queueUrl = env["QUEUE_URL"] as string;
const sqs = new AWSSQSPublisher(new SQS(), queueUrl);
const logger = services.logger;

const configuration: HandlerConfiguration = {
  log: services.logger,
  users: services.users,
  sqs: sqs,
};

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  logger.debug("Received event", event);
  const response = await webformCallback(event, context, configuration);
  logger.debug("Responding with", response);
  return response;
};
