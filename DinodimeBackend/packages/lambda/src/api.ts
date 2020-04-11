import { APIGatewayProxyEvent, Context } from "aws-lambda";

import { CreateInternalErrorResponse, CreateSimpleResponse } from "./lambda-util";
import { ServiceProvider } from "./service-provider";
import * as authenticationController from "./controllers/authentication-controller";
import * as bankController from "./controllers/bank-controller";

const services = new ServiceProvider(process.env);
const logger = services.logger;

/*
 * Authentication Controller
 * -------------------------
 */
export const isUserAuthenticated = async (event: APIGatewayProxyEvent, context: Context) => {
  logger.debug("received event", event);
  try {
    const response = await authenticationController.isUserAuthenticated(
      event,
      context,
      logger,
      services.bankInterface,
      services.users
    );
    logger.debug("returning regular response", response);
    return response;
  } catch (err) {
    logger.error("error authorizing", err);
    return CreateInternalErrorResponse(err);
  }
};

export const registerUser = async (event: APIGatewayProxyEvent, context: Context) => {
  logger.debug("received event", event);
  try {
    const response = await authenticationController.registerUser(
      event,
      context,
      logger,
      services.clientSecrets,
      services.authentication,
      services.bankInterface,
      services.users
    );
    logger.debug("returning regular response", response);
    return response;
  } catch (err) {
    logger.error("error registering user", err);
    const response = CreateInternalErrorResponse(err);
    logger.debug("returning error response", response);
    return response;
  }
};

export const authenticateAndSaveUser = async (event: APIGatewayProxyEvent, context: Context) => {
  logger.debug("received event", event);
  try {
    const response = await authenticationController.authenticateAndSave(
      event,
      context,
      logger,
      services.clientSecrets,
      services.authentication
    );
    logger.debug("returning regular response", response);
    return response;
  } catch (err) {
    logger.error("error logging in user", err);
    const response = CreateInternalErrorResponse(err);
    logger.debug("returning error response", response);
    return response;
  }
};

export const updateRefreshToken = async (event: APIGatewayProxyEvent, context: Context) => {
  logger.debug("received event", event);
  try {
    const response = await authenticationController.updateRefreshToken(
      event,
      context,
      logger,
      services.clientSecrets,
      services.authentication,
      services.bankInterface,
      services.users
    );
    logger.debug("returning regular response", response);
    return response;
  } catch (err) {
    logger.error("error refreshing token", err);
    const response = CreateInternalErrorResponse(err);
    logger.debug("returning error response", response);
    return response;
  }
};

/*
 * Bank Controller
 * ---------------
 */
export const getBankByBLZ = async (event: APIGatewayProxyEvent, context: Context) => {
  logger.debug("received event", event);
  try {
    const response = await bankController.getBankByBLZ(
      event,
      context,
      logger,
      services.clientSecrets,
      services.authentication,
      services.bankInterface
    );
    logger.debug("returning regular response", response);
    return response;
  } catch (err) {
    logger.error("error listing banks", err);
    const response = CreateInternalErrorResponse(err);
    logger.debug("returning error response", response);
    return response;
  }
};

export const getWebFormId = async (event: APIGatewayProxyEvent, context: Context) => {
  logger.debug("received event", event);
  try {
    const response = await bankController.getWebformId(
      event,
      context,
      logger,
      services.bankInterface,
      services.users,
      services.encryptions
    );
    logger.debug("returning regular response", response);
    return response;
  } catch (err) {
    logger.error("error importing bank connection", err);
    const response = CreateInternalErrorResponse(err);
    logger.debug("returning error response", response);
    return response;
  }
};

export const getRecurrentTransactions = async (event: APIGatewayProxyEvent, context: Context) => {
  logger.debug("received event", event);
  try {
    const response = await bankController.getRecurrentTransactions(
      event,
      context,
      logger,
      services.bankInterface,
      services.users,
      services.connections,
      services.recurrentTransactions
    );
    logger.debug("returning regular response", response);
    return response;
  } catch (err) {
    logger.error("error get recurrent transactions", err);
    const response = CreateInternalErrorResponse(err);
    logger.debug("returning error response", response);
    return response;
  }
};

export const updateRecurrentTransactions = async (event: APIGatewayProxyEvent, context: Context) => {
  logger.debug("received event", event);
  try {
    const response = await bankController.updateRecurrentTransactions(
      event,
      context,
      logger,
      services.bankInterface,
      services.users,
      services.recurrentTransactions
    );
    logger.debug("returning regular response", response);
    return response;
  } catch (err) {
    logger.error("error get recurrent transactions", err);
    const response = CreateInternalErrorResponse(err);
    logger.debug("returning error response", response);
    return response;
  }
};

export const getAllowance = async (event: APIGatewayProxyEvent, context: Context) => {
  logger.debug("received event", event);
  try {
    const response = await bankController.getAllowance(event, context, logger, services.bankInterface, services.users);
    logger.debug("returning regular response", response);
    return response;
  } catch (err) {
    logger.error("error fetching fetching allowance", err);
    const response = CreateInternalErrorResponse(err);
    logger.debug("returning error response", response);
    return response;
  }
};
