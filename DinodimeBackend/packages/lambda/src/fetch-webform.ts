import SQS from "aws-sdk/clients/sqs";
import { Context, SQSEvent } from "aws-lambda";
import { AWSSQSClient } from "dinodime-lib";
import { ServiceProvider } from "./service-provider";
import { HandlerConfiguration, fetchWebForm } from "./fetch-webform-handler";

const env = process.env;
const services = new ServiceProvider(env);
const queueUrl = env["QUEUE_URL"] as string;
const sqs = new AWSSQSClient(new SQS(), queueUrl);

export const handler = async (event: SQSEvent, context: Context) => {
  const configuration: HandlerConfiguration = {
    log: services.logger,
    users: services.users,
    sqs: sqs,
    connections: services.connections,
    transactions: services.transactions,
    bankInterface: services.bankInterface,
    encryptions: services.encryptions,
  };

  return fetchWebForm(event, context, configuration);
};
