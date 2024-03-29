import { APIGatewayProxyResult } from "aws-lambda";
import { Token } from "dinodime-sharedmodel";
import { RestMessage } from "dinodime-message";

export const HasAuthorization = (header: any): string => {
  return header["authorization"] || header["Authorization"];
};

const EncodeResponse = (status: number, body: any): APIGatewayProxyResult => {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
};

export const CreateResponse = (status: number, body: RestMessage) => {
  return EncodeResponse(status, body);
};

export const CreateSimpleResponse = (status: number, message: string) => {
  return EncodeResponse(status, {
    message: message,
  });
};

export const CreateInternalErrorResponse = (errMessage: string) => {
  return CreateSimpleResponse(500, errMessage);
};

export const HasMissingProperty = (obj: any, properties: string[]): string | null => {
  for (let i = 0; i < properties.length; i++) {
    const expectedProperty = properties[i];

    if (!Object.prototype.hasOwnProperty.call(obj, expectedProperty)) {
      return expectedProperty;
    }
  }

  return null;
};

export const CreateAuthHeader = (credentials: Token): string => {
  return credentials.token_type + " " + credentials.access_token;
};
