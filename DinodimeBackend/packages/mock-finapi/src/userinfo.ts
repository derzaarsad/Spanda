import { FinAPIModel } from "dinodime-lib";
import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { CreateResponse, HasAuthorization as hasAuthorization } from "./lambda-util";
import * as winston from "winston";

export interface UserInfoConfiguration {
  authenticatedUser: FinAPIModel.User;
  authenticatedUserToken: string;
  logger: winston.Logger;
}

const unauthorized = CreateResponse(401, "unauthorized");

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
