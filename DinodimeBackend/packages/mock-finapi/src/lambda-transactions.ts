import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from "./lambda-util";
import { TranscationsHandlerConfiguration, transactionsHandler } from "./transactions";
import Constants from "./constants";

const logger = createLogger(process.env);

const configuration: TranscationsHandlerConfiguration = {
  transactionsPerAccountId: Constants.transactionsPerAccountId,
  logger: logger
};

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  logger.debug("Received event", event);
  const response = transactionsHandler(configuration, event, context);
  logger.debug("Responding with", response);
  return response;
};
