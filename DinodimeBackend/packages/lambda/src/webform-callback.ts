import winston from "winston";
import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { CreateInternalErrorResponse, CreateSimpleResponse } from "./lambda-util";
import { Users, WebFormCompletion, SQSPublisher } from "dinodime-lib";

// Since this can be called by anyone, don't reveal anything in the response
const response = CreateSimpleResponse(202, "Accepted");

export interface HandlerConfiguration {
  sqs: SQSPublisher;
  queueUrl: string;
  users: Users.UsersRepository;
  log: winston.Logger;
}

export const webformCallback = async (
  event: APIGatewayProxyEvent,
  context: Context,
  configuration: HandlerConfiguration
): Promise<APIGatewayProxyResult> => {
  const log = configuration.log;
  const queueUrl = configuration.queueUrl;
  const sqs = configuration.sqs;
  const users = configuration.users;

  log.debug("Received event", event);

  const pathParameters = event.pathParameters;
  if (pathParameters === null || !pathParameters.webFormAuth) {
    log.error("No authorization provided");
    return response;
  }

  const webFormAuth = pathParameters.webFormAuth;
  const tokens = webFormAuth.split("-");
  if (tokens.length !== 2) {
    log.error("Invalid webform authorization received: " + webFormAuth);
    return response;
  }

  const webFormId = parseInt(tokens[0]);
  const userSecret = tokens[1];

  if (isNaN(webFormId) || userSecret.length === 0) {
    log.error(`Invalid webform authorization received: ${webFormAuth}`);
    return response;
  }

  const user = await users.findByWebFormId(webFormId);
  if (user === null || user.activeWebFormId === null || user.activeWebFormAuth === null) {
    log.error(`No user found for webId ${webFormId} or user has no associated webform auth`);
    return response;
  }

  const messageBody: WebFormCompletion = {
    webFormId: webFormId,
    userSecret: userSecret
  };

  const sendMessageRequest = {
    queueUrl: queueUrl,
    messageBody: messageBody
  };

  return sqs
    .publish(sendMessageRequest)
    .then(() => {
      log.info(`Successfully sent message to topic ${queueUrl}`);
      return response;
    })
    .catch(err => {
      log.error(`Error sending message to topic ${queueUrl}`, err);
      return response;
    });
};
