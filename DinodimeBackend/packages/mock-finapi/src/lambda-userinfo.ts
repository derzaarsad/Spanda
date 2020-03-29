import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from "./lambda-util";
import { UserInfoConfiguration, userInfoHandler } from "./userinfo";
import Constants from "./constants";

const logger = createLogger(process.env);

const configuration: UserInfoConfiguration = {
  authenticatedUser: Constants.authenticatedUser,
  authenticatedUserToken: Constants.authenticatedUserToken,
  logger: logger
};

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  logger.debug("Received event", event);
  const response = userInfoHandler(configuration, event, context);
  logger.debug("Responding with", response);
  return response;
};
