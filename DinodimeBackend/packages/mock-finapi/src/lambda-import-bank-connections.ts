import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from "./lambda-util";
import { WebFormHandlerConfiguration, webFormHandler } from "./import-bank-connections";
import Constants from "./constants";

const logger = createLogger(process.env);

const configuration: WebFormHandlerConfiguration = {
  webFormRespose: Constants.webFormRedirectResponse,
  logger: logger
};

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  logger.debug("Received event", event);
  const response = webFormHandler(configuration, event, context);
  logger.debug("Responding with", response);
  return response;
};
