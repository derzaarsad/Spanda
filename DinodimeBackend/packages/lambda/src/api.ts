import { APIGatewayProxyEvent, Context } from "aws-lambda";

import { CreateInternalErrorResponse, CreateSimpleResponse } from "./lambda-util";
import CreateLogger from "./create-logger";
import { ServiceProvider } from "./service-provider";
import * as authenticationController from "./controllers/authentication-controller";
import * as bankController from "./controllers/bank-controller";
import * as testController from "./controllers/test-controller";

const env = process.env;
const logger = CreateLogger(env);
const services = new ServiceProvider(env);

/*
 * Authentication Controller
 * -------------------------
 */
export const isUserAuthenticated = async (event: APIGatewayProxyEvent, context: Context) => {
  logger.debug("received event", event);
  try {
    const response = authenticationController.isUserAuthenticated(
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
    const response = authenticationController.registerUser(
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
    const response = authenticationController.authenticateAndSave(
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
    const response = authenticationController.updateRefreshToken(
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
    const response = bankController.getBankByBLZ(
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
    const response = bankController.getWebformId(
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

export const webFormCallback = async (event: APIGatewayProxyEvent, context: Context) => {
  logger.debug("received event", event);
  try {
    // TODO: not finished!
    console.log(event.pathParameters);
    const response = CreateSimpleResponse(200, "the function is called!");
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
    const response = bankController.getRecurrentTransactions(
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
    const response = bankController.updateRecurrentTransactions(
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

export const fetchWebFormInfo = async (event: APIGatewayProxyEvent, context: Context) => {
  logger.debug("received event", event);
  try {
    const response = bankController.fetchWebFormInfo(
      event,
      context,
      logger,
      services.bankInterface,
      services.users,
      services.connections,
      services.transactions,
      services.encryptions
    );
    logger.debug("returning regular response", response);
    return response;
  } catch (err) {
    logger.error("error fetching webform id", err);
    const response = CreateInternalErrorResponse(err);
    logger.debug("returning error response", response);
    return response;
  }
};

export const getAllowance = async (event: APIGatewayProxyEvent, context: Context) => {
  logger.debug("received event", event);
  try {
    const response = bankController.getAllowance(event, context, logger, services.bankInterface, services.users);
    logger.debug("returning regular response", response);
    return response;
  } catch (err) {
    logger.error("error fetching fetching allowance", err);
    const response = CreateInternalErrorResponse(err);
    logger.debug("returning error response", response);
    return response;
  }
};

/*
 * Test Controller
 * ---------------
 */
export const testPush = async (event: APIGatewayProxyEvent, context: Context) => {
  logger.debug("received event", event);
  try {
    const response = testController.testPush(
      event,
      context,
      logger,
      services.firebaseMessaging
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