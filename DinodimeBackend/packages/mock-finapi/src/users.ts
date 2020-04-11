import { FinAPIModel } from "dinodime-lib";
import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { CreateResponse, HasAuthorization as hasAuthorization } from "./lambda-util";
import * as winston from "winston";

const unauthorized = CreateResponse(401, "unauthorized");
const badRequest = CreateResponse(400, "bad request");

export interface CreateUserHandlerConfiguration {
  authenticatedUser: FinAPIModel.User;
  logger: winston.Logger;
}

export interface UserInfoConfiguration {
  authenticatedUser: FinAPIModel.User;
  authenticatedUserToken: string;
  logger: winston.Logger;
}

export const createUserHandler = async (
  configuration: CreateUserHandlerConfiguration,
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const { authenticatedUser } = configuration;

  const body = event.body;

  if (!body) {
    return badRequest;
  }

  const user = JSON.parse(body) as FinAPIModel.User;

  if (authenticatedUser.password === user.password && authenticatedUser.id === user.id) {
    return CreateResponse(200, user);
  } else {
    return badRequest;
  }
};

export const userInfoHandler = async (
  configuration: UserInfoConfiguration,
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const authorization = hasAuthorization(event.headers);

  if (!authorization) {
    return unauthorized;
  }

  const tokens = authorization.split(" ", 2);

  if (tokens.length != 2) {
    return unauthorized;
  }

  const bearerToken = tokens[1];

  if (bearerToken === configuration.authenticatedUserToken) {
    return CreateResponse(200, configuration.authenticatedUser);
  } else {
    return unauthorized;
  }
};
