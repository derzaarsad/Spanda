import { APIGatewayProxyEvent, Context } from "aws-lambda";

import { CreateInternalErrorResponse, CreateSimpleResponse } from "./lambda-util";
import { ServiceProvider } from "./service-provider";
import { addUserHandler, deleteUserHandler, deleteUserDataHandler, getUserDataHandler } from "./admin-api-handler";

const services = new ServiceProvider(process.env);
const logger = services.logger;

const configuration = {
  clientSecrets: services.clientSecrets,
  authentication: services.authentication,
  bankInterface: services.bankInterface,
  users: services.users,
  bankConnections: services.connections,
  transactions: services.transactions,
  recurrentTransactions: services.recurrentTransactions,
  logger: logger,
};

export const deleteUserData = async (event: APIGatewayProxyEvent, context: Context) => {
  logger.debug("Received event", event);
  try {
    const response = await deleteUserDataHandler(configuration, event, context);
    logger.debug("Responding with", response);
    return response;
  } catch (err) {
    logger.log("error", "error authorizing", err);
    return CreateInternalErrorResponse(err);
  }
};

export const getUserData = async (event: APIGatewayProxyEvent, context: Context) => {
  logger.debug("Received event", event);
  try {
    const response = await getUserDataHandler(configuration, event, context);
    logger.debug("Responding with", response);
    return response;
  } catch (err) {
    logger.log("error", "error authorizing", err);
    return CreateInternalErrorResponse(err);
  }
};

export const addUser = async (event: APIGatewayProxyEvent, context: Context) => {
  logger.debug("Received event", event);
  try {
    const response = await addUserHandler(configuration, event, context);
    logger.debug("Responding with", response);
    return response;
  } catch (err) {
    logger.log("error", "error authorizing", err);
    return CreateInternalErrorResponse(err);
  }
};

export const deleteUser = async (event: APIGatewayProxyEvent, context: Context) => {
  logger.debug("Received event", event);
  try {
    const response = await deleteUserHandler(configuration, event, context);
    logger.debug("Responding with", response);
    return response;
  } catch (err) {
    logger.log("error", "error authorizing", err);
    return CreateInternalErrorResponse(err);
  }
};
