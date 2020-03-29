import winston from "winston";
import { APIGatewayProxyResult } from "aws-lambda";

export const HasAuthorization = (header: any): string => {
  return header["authorization"] || header["Authorization"];
};

const EncodeResponse = (status: number, body: any): APIGatewayProxyResult => {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
};

export const CreateResponse = (status: number, body: any) => {
  return EncodeResponse(status, body);
};

export const CreateSimpleResponse = (status: number, message: string) => {
  return EncodeResponse(status, {
    message: message
  });
};

export const createLogger = (env: NodeJS.ProcessEnv) => {
  console.log("Configuring logger from environment:");

  return winston.createLogger({
    level: env["LOGGER_LEVEL"] || "debug",
    format: winston.format.json(),
    transports: [
      new winston.transports.Console({
        format: winston.format.json()
      })
    ]
  });
};
