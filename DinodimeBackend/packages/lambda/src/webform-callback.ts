import SQS from "aws-sdk/clients/sqs";
import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { AWSSQSPublisher } from "dinodime-lib";
import { ServiceProvider } from "./service-provider";
import { HandlerConfiguration, webformCallback } from "./webform-callback-handler";

const env = process.env;
const services = new ServiceProvider(env);
const queueUrl = env["QUEUE_URL"] as string;
const sqs = new AWSSQSPublisher(new SQS(), queueUrl);

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  const configuration: HandlerConfiguration = {
    log: services.logger,
    users: services.users,
    sqs: sqs
  };

  return webformCallback(event, context, configuration);
};
