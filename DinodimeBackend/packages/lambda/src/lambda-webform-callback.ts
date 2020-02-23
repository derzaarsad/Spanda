import SQS from "aws-sdk/clients/sqs";

import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { AWSSQSPublisher } from "dinodime-lib";
import { ServiceProvider } from "./service-provider";
import { HandlerConfiguration, webformCallback } from "./webform-callback";

const env = process.env;
const queueUrl = env["QUEUE_URL"] as string;
const services = new ServiceProvider(env);
const sqs = new AWSSQSPublisher(new SQS());

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const configuration: HandlerConfiguration = {
    log: services.logger,
    users: services.users,
    sqs: sqs,
    queueUrl: queueUrl
  };
  return webformCallback(event, context, configuration);
};
