import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { CreateInternalErrorResponse, CreateSimpleResponse } from "./lambda-util";
import { ServiceProvider } from "./service-provider";
import { WebFormCompletion } from "dinodime-lib";
import SQS from "aws-sdk/clients/sqs";

const env = process.env;

const services = new ServiceProvider(env);
const log = services.logger;
const users = services.users;

const queueUrl = env["QUEUE_URL"];
const sqs = new SQS();

// Since this can be called by anyone, don't reveal anything in the response
const response = CreateSimpleResponse(202, "Accepted");

export const receiveWebformId = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  log.debug("Received event", event);

  const pathParameters = event.pathParameters;
  if (pathParameters === null || !pathParameters.webFormAuth) {
    return CreateInternalErrorResponse("no webFormAuth");
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

  const sendMessageRequest: SQS.Types.SendMessageRequest = {
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(messageBody)
  };

  return sqs
    .sendMessage(sendMessageRequest)
    .promise()
    .then(() => {
      log.info("Successfully sent message to topic");
      return response;
    })
    .catch(err => {
      log.error("Error sending message to topic", err);
      return response;
    });
};
