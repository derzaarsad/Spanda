import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import winston from "winston";
import {
  CreateSimpleResponse,
  CreateInternalErrorResponse,
  CreateResponse,
  HasAuthorization,
  HasMissingProperty,
  CreateAuthHeader,
} from "../lambda-util";

import { Authentication, Token } from "dinodime-lib";
import { User, Users } from "dinodime-lib";
import { ClientSecretsProvider, FinAPI, FinAPIModel, FirebaseMessaging } from "dinodime-lib";

type RefreshTokenParams = {
  refresh_token: string;
};

type PasswordCredentialParams = {
  username: string;
  password: string;
};

type UserParams = {
  id: string;
  password: string;
  email: string;
  phone: string;
  isAutoUpdateEnabled: boolean;
};

const expectedPasswordCredentialProperties = ["username", "password"];
const expectedRefreshTokenProperties = ["refresh_token"];
const expectedUserProperties = ["id", "password", "email", "phone", "isAutoUpdateEnabled"];

const isRefreshTokenParams = (body: any): body is RefreshTokenParams => {
  if (body === null) {
    return false;
  }
  const missingProperty = HasMissingProperty(body, expectedRefreshTokenProperties);
  return missingProperty === null;
};

const isPasswordCredentialParams = (body: any): body is PasswordCredentialParams => {
  if (body === null) {
    return false;
  }
  const missingProperty = HasMissingProperty(body, expectedPasswordCredentialProperties);
  return missingProperty === null;
};

const isUserParams = (body: any): body is UserParams => {
  if (body === null) {
    return false;
  }
  const missingProperty = HasMissingProperty(body, expectedUserProperties);
  return missingProperty === null;
};

const getUserInfo = async (
  logger: winston.Logger,
  bankInterface: FinAPI,
  authorization: string
): Promise<FinAPIModel.User> => {
  logger.log("info", "authenticating user", { authorization: authorization });
  return bankInterface.userInfo(authorization);
};

// @Post('/test/push')
// @BodyProp() username: string,
// @BodyProp() password: string
export const testPush = async (
  event: APIGatewayProxyEvent,
  context: Context,
  logger: winston.Logger,
  firebaseMessaging: FirebaseMessaging
): Promise<APIGatewayProxyResult> => {
  if (event.body === null) {
    return CreateSimpleResponse(400, "empty body received");
  }

  let body: any = JSON.parse(event.body);
  console.log(body);

  const registrationToken = body.registrationToken;

  return firebaseMessaging.sendMessage(registrationToken, {
    datasample: "chapman"
  }).then(response => CreateResponse(200, response))
    .catch((err) => {
      logger.log("error", "error at test ", { cause: err });
      return CreateSimpleResponse(401, "error at test");
    });
};
