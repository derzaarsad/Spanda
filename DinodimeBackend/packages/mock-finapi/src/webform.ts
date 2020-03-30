import { FinAPIModel } from "dinodime-lib";
import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { CreateResponse } from "./lambda-util";
import * as winston from "winston";

export interface WebFormHandlerConfiguration {
  webFormResponse: FinAPIModel.WebForm;
  logger: winston.Logger;
}

export const webFormHandler = async (
  configuration: WebFormHandlerConfiguration,
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  return CreateResponse(200, configuration.webFormResponse);
};
