import { APIGatewayProxyEvent, Context } from "aws-lambda";

import { CreateInternalErrorResponse, CreateSimpleResponse } from "./lambda-util";
import { ServiceProvider } from "./service-provider";

import * as authenticationController from "./controllers/authentication-controller";
import * as bankController from "./controllers/bank-controller";

const services = new ServiceProvider(process.env);
const logger = services.logger;
