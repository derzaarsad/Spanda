import { APIGatewayProxyEvent, Context } from "aws-lambda";

import { CreateInternalErrorResponse, CreateSimpleResponse } from "./lambda-util";
import CreateLogger from "./create-logger";
import { ServiceProvider } from "./service-provider";
import * as authenticationController from "./controllers/authentication-controller";
import * as bankController from "./controllers/bank-controller";

const env = process.env;
const logger = CreateLogger(env);
const services = new ServiceProvider(env);

/*
 * Authentication Controller
 * -------------------------
 */
export const isUserAuthenticated = async (event: APIGatewayProxyEvent, context: Context) => {
  try {
    return authenticationController.isUserAuthenticated(
      event,
      context,
      logger,
      services.bankInterface
    );
  } catch (err) {
    logger.log("error", "error authorizing", err);
    return CreateInternalErrorResponse(err);
  }
};

export const registerUser = async (event: APIGatewayProxyEvent, context: Context) => {
  try {
    return authenticationController.registerUser(
      event,
      context,
      logger,
      services.clientSecrets,
      services.authentication,
      services.bankInterface,
      services.users
    );
  } catch (err) {
    logger.log("error", "error registering user", err);
    return CreateInternalErrorResponse(err);
  }
};

export const authenticateAndSaveUser = async (event: APIGatewayProxyEvent, context: Context) => {
  try {
    return authenticationController.authenticateAndSave(
      event,
      context,
      logger,
      services.clientSecrets,
      services.authentication
    );
  } catch (err) {
    logger.log("error", "error logging in user", err);
    return CreateInternalErrorResponse(err);
  }
};

export const updateRefreshToken = async (event: APIGatewayProxyEvent, context: Context) => {
  try {
    return authenticationController.updateRefreshToken(
      event,
      context,
      logger,
      services.clientSecrets,
      services.authentication
    );
  } catch (err) {
    logger.log("error", "error refreshing token", err);
    return CreateInternalErrorResponse(err);
  }
};

/*
 * Bank Controller
 * ---------------
 */
export const getBankByBLZ = async (event: APIGatewayProxyEvent, context: Context) => {
  try {
    return bankController.getBankByBLZ(
      event,
      context,
      logger,
      services.clientSecrets,
      services.authentication,
      services.bankInterface
    );
  } catch (err) {
    logger.log("error", "error listing banks", err);
    return CreateInternalErrorResponse(err);
  }
};

export const getWebFormId = async (event: APIGatewayProxyEvent, context: Context) => {
  try {
    return bankController.getWebformId(
      event,
      context,
      logger,
      services.bankInterface,
      services.users,
      services.encryptions
    );
  } catch (err) {
    logger.log("error", "error importing bank connection", err);
    return CreateInternalErrorResponse(err);
  }
};

export const webFormCallback = async (event: APIGatewayProxyEvent, context: Context) => {
  try {
    // TODO: not finished!
    console.log(event.pathParameters);
    return CreateSimpleResponse(200, "the function is called!");
  } catch (err) {
    logger.log("error", "error importing bank connection", err);
    return CreateInternalErrorResponse(err);
  }
};

export const fetchWebFormInfo = async (event: APIGatewayProxyEvent, context: Context) => {
  try {
    return bankController.fetchWebFormInfo(
      event,
      context,
      logger,
      services.bankInterface,
      services.users,
      services.connections,
      services.transactions,
      services.encryptions
    );
  } catch (err) {
    logger.log("error", "error fetching webform id", err);
    return CreateInternalErrorResponse(err);
  }
};

export const getAllowance = async (event: APIGatewayProxyEvent, context: Context) => {
  try {
    return bankController.getAllowance(
      event,
      context,
      logger,
      services.bankInterface,
      services.users
    );
  } catch (err) {
    logger.log("error", "error fetching fetching allowance", err);
    return CreateInternalErrorResponse(err);
  }
};
