import { FinAPIModel } from "dinodime-lib";
import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { CreateResponse, HasAuthorization as hasAuthorization } from "./lambda-util";
import * as winston from "winston";

export interface WebFromHandlerConfiguration {
  webFormResponse: FinAPIModel.WebForm;
  logger: winston.Logger;
}

const badRequest = CreateResponse(400, "bad request");

export const webFormHandler = async (
  configuration: WebFromHandlerConfiguration,
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  return CreateResponse(200, configuration.webFormResponse);
};
