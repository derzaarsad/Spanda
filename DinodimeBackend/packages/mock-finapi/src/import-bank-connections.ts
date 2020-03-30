import { FinAPIModel } from "dinodime-lib";
import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { CreateResponse, HasAuthorization as hasAuthorization } from "./lambda-util";
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
  return CreateResponse(200, configuration.webFormRespose);
};
