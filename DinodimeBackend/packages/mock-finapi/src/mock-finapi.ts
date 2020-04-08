import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from "./lambda-util";
import { transactionsHandler } from "./transactions";
import { getTokenHandler } from "./authorization";
import { userInfoHandler } from "./users";
import { createUserHandler } from "./users";
import { webFormHandler } from "./webform";
import { importBankConnectionsHandler } from "./import-bank-connections";
import Constants from "./constants";

const logger = createLogger(process.env);

const transactionsHandlerConfiguration = {
  transactionsPerAccountId: Constants.transactionsPerAccountId,
  logger: logger,
};

const userInfoHandlerConfiguration = {
  authenticatedUser: Constants.authenticatedUser,
  authenticatedUserToken: Constants.authenticatedUserToken,
  logger: logger,
};

const webFormHandlerConfiguration = {
  webFormResponse: Constants.webFormResponse,
  logger: logger,
};

const importBankConnectionsHandlerConfiguration = {
  webFormRespose: Constants.webFormRedirectResponse,
  logger: logger,
};

const createUserHandlerConfiguration = {
  authenticatedUser: Constants.authenticatedUser,
  logger: logger,
};

const getTokenHandlerConfiguration = {
  clientCredentials: Constants.clientCredentials,
  clientToken: Constants.clientToken,
  authenticatedUser: Constants.authenticatedUser,
  authenticatedUserToken: Constants.authenticatedUserToken,
  logger: logger,
};

export const getToken = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  logger.debug("Received event", event);
  const response = getTokenHandler(getTokenHandlerConfiguration, event, context);
  logger.debug("Responding with", response);
  return response;
};

export const createUser = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  logger.debug("Received event", event);
  const response = createUserHandler(createUserHandlerConfiguration, event, context);
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

export const transactions = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  logger.debug("Received event", event);
  const response = transactionsHandler(transactionsHandlerConfiguration, event, context);
  logger.debug("Responding with", response);
  return response;
};
