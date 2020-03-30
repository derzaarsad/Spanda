import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from "./lambda-util";
import { TranscationsHandlerConfiguration, transactionsHandler } from "./transactions";
import { UserInfoConfiguration, userInfoHandler } from "./userinfo";
import { WebFormHandlerConfiguration, webFormHandler } from "./webform";
import { ImportBankConnectionsHandlerConfiguration, importBankConnectionsHandler } from "./import-bank-connections";
import Constants from "./constants";

const logger = createLogger(process.env);

const transactionsHandlerConfiguration: TranscationsHandlerConfiguration = {
  transactionsPerAccountId: Constants.transactionsPerAccountId,
  logger: logger
};

const userInfoHandlerConfiguration: UserInfoConfiguration = {
  authenticatedUser: Constants.authenticatedUser,
  authenticatedUserToken: Constants.authenticatedUserToken,
  logger: logger
};

const webFormHandlerConfiguration: WebFormHandlerConfiguration = {
  webFormResponse: Constants.webFormResponse,
  logger: logger
};

const importBankConnectionsHandlerConfiguration: ImportBankConnectionsHandlerConfiguration = {
  webFormRespose: Constants.webFormRedirectResponse,
  logger: logger
};

export const transactions = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  logger.debug("Received event", event);
  const response = transactionsHandler(transactionsHandlerConfiguration, event, context);
  logger.debug("Responding with", response);
  return response;
};

export const userinfo = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  logger.debug("Received event", event);
  const response = userInfoHandler(userInfoHandlerConfiguration, event, context);
  logger.debug("Responding with", response);
  return response;
};

export const webform = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  logger.debug("Received event", event);
  const response = webFormHandler(webFormHandlerConfiguration, event, context);
  logger.debug("Responding with", response);
  return response;
};

export const importBankConnections = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  logger.debug("Received event", event);
  const response = importBankConnectionsHandler(importBankConnectionsHandlerConfiguration, event, context);
  logger.debug("Responding with", response);
  return response;
};
