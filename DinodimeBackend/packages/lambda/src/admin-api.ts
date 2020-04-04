import { APIGatewayProxyEvent, Context } from "aws-lambda";

import { CreateInternalErrorResponse, CreateSimpleResponse } from "./lambda-util";
import { ServiceProvider } from "./service-provider";
import { deleteUserDataHandler } from "./admin-api-handler";

const services = new ServiceProvider(process.env);
const logger = services.logger;

const configuration = {
  clientSecrets: services.clientSecrets,
  authentication: services.authentication,
  bankInterface: services.bankInterface,
  users: services.users,
  bankConnections: services.connections,
  transactions: services.transactions,
  recurrentTransactions: services.recurrentTransactions,
  logger: logger
};

export const deleteUserData = async (event: APIGatewayProxyEvent, context: Context) => {
  logger.debug("Received event", event);
  try {
    return deleteUserDataHandler(configuration, event, context);
  } catch (err) {
    logger.log("error", "error authorizing", err);
    return CreateInternalErrorResponse(err);
  }
};
