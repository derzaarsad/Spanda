import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { CreateInternalErrorResponse, CreateSimpleResponse } from "./lambda-util";
import { ServiceProvider } from "./service-provider";

const services = new ServiceProvider(process.env);
const logger = services.logger;

export const receiveWebformId = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  throw new Error("implement me");
};
