import { FinAPIModel } from "dinodime-lib";
import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { CreateResponse } from "./lambda-util";
import * as winston from "winston";

export interface ImportBankConnectionsHandlerConfiguration {
  webFormRespose: FinAPIModel.ErrorMessage;
  logger: winston.Logger;
}

export const importBankConnectionsHandler = async (
  configuration: ImportBankConnectionsHandlerConfiguration,
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  return CreateResponse(451, configuration.webFormRespose);
};
