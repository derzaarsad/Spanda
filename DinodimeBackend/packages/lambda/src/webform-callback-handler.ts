import winston from "winston";
import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { Users, WebFormCompletion, SQSPublisher, Status } from "dinodime-lib";
import { CreateSimpleResponse } from "./lambda-util";

// Since this can be called by anyone, we don't reveal anything in the response
const response = CreateSimpleResponse(202, "Accepted");

export interface HandlerConfiguration {
  sqs: SQSPublisher;
  users: Users.UsersRepository;
  log: winston.Logger;
}

/**
 * Receives a webform coordinates as path parameters and puts a WebFormCompletion on an SQS queue.
 */
export const webformCallback = async (
  event: APIGatewayProxyEvent,
  context: Context,
  configuration: HandlerConfiguration
): Promise<APIGatewayProxyResult> => {
  const log = configuration.log;
  const sqs = configuration.sqs;
  const users = configuration.users;

  log.debug("Received event", event);

  const pathParameters = event.pathParameters;
  if (pathParameters === null || !pathParameters.webFormAuth) {
    log.error("No authorization provided");
    return response;
  }

  const webFormAuth = pathParameters.webFormAuth;
  const tokens = webFormAuth.split("-", 2);
  if (tokens.length !== 2) {
    log.error(`Invalid webform authorization received: ${webFormAuth}`);
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
    userSecret: userSecret,
  };

  const sendMessageRequest = {
    messageBody: messageBody,
  };

  return sqs
    .publish(sendMessageRequest)
    .then((status: Status<String>) => {
      if (status.kind === "success") {
        log.info(`Successfully sent message ${status.result} to queue`, status);
      } else {
        log.error("Could not send message message to queue", status.error);
      }
      return response;
    })
    .catch((err) => {
      log.error("Error sending message to topic", err);
      return response;
    });
};
