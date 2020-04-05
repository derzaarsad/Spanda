import * as querystring from "querystring";
import * as winston from "winston";

import { FinAPIModel } from "dinodime-lib";
import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { CreateResponse } from "./lambda-util";

const tokenType = "bearer";
const scope = "all";

const unauthorized = CreateResponse(401, "unauthorized");
const badRequest = CreateResponse(400, "bad request");

export interface GetTokenHandlerConfiguration {
  authenticatedUser: FinAPIModel.User;
  authenticatedUserToken: string;
  logger: winston.Logger;
}

export const getTokenHandler = async (
  configuration: GetTokenHandlerConfiguration,
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const { logger, authenticatedUser, authenticatedUserToken } = configuration;

  const accessToken: FinAPIModel.AccessToken = {
    expiresIn: 0,
    accessToken: authenticatedUserToken,
    scope: scope,
    tokenType: tokenType
  };

  const success = CreateResponse(200, accessToken);

  const body = event.body;

  if (!body) {
    return badRequest;
  }

  const parameters = querystring.parse(body);

  if (!parameters) {
    return badRequest;
  }

  const grantType = parameters["grant_type"] as string;
  const refreshToken = parameters["refresh_token"] as string;
  const username = parameters["username"] as string;
  const password = parameters["password"] as string;

  if (!grantType) {
    return badRequest;
  }

  if (grantType === "refresh_token" && refreshToken) {
    logger.debug("getting a refresh token");
    if (refreshToken === authenticatedUserToken) {
      return success;
    } else {
      return unauthorized;
    }
  } else if (grantType === "password" && username && password) {
    if (username === authenticatedUser.id && password === authenticatedUser.password) {
      return success;
    } else {
      return unauthorized;
    }
  } else {
    return unauthorized;
  }
};
