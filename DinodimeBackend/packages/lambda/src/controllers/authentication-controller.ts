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

import { getUserInfo } from "../userinfo";
import { isUserParams } from "../user-params";
import { Authentication } from "dinodime-lib";
import { User, Users } from "dinodime-lib";
import { ClientSecretsProvider, FinAPI, FinAPIModel } from "dinodime-lib";
import { UserVerificationMessage } from "dinodime-message";
import { Token } from "dinodime-sharedmodel";

type RefreshTokenParams = {
  refresh_token: string;
};

type PasswordCredentialParams = {
  username: string;
  password: string;
};

const expectedPasswordCredentialProperties = ["username", "password"];
const expectedRefreshTokenProperties = ["refresh_token"];

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

// pasted from emailregex.com
const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// pasted from emailregex.com (should be valid for Germany)
const phoneRegex = /^([+][0-9]{1,3}[ .-])?([(]{1}[0-9]{1,6}[)])?([0-9 .\-/]{3,20})((x|ext|extension)[ ]?[0-9]{1,4})?$/;

// @Get('/users')
// @Header('Authorization') authorization: string
export const isUserAuthenticated = async (
  event: APIGatewayProxyEvent,
  context: Context,
  logger: winston.Logger,
  bankInterface: FinAPI,
  users: Users.UsersRepository
): Promise<APIGatewayProxyResult> => {
  const authorization = HasAuthorization(event.headers);

  if (!authorization) {
    return CreateSimpleResponse(401, "unauthorized");
  }

  try {
    let userInfo = await getUserInfo({ logger, bankInterface }, authorization);
    let user: User | null = await users.findById(userInfo.id);
    if (!user) {
      logger.log("error", "error authenticating user", "user is not found in the database.");
      return CreateInternalErrorResponse("internal server error");
    }
    return CreateResponse(200, new UserVerificationMessage(user.isRecurrentTransactionConfirmed, user.isAllowanceReady));
  } catch (err) {
    logger.log("error", "error authenticating user", err);
    return CreateSimpleResponse(401, "unauthorized");
  }
};

// @Post('/users')
// @BodyProp() id: string
// @BodyProp() password
// @BodyProp() email: string
// @BodyProp() phone: string
// @BodyProp() isAutoUpdateEnabled: boolean
export const registerUser = async (
  event: APIGatewayProxyEvent,
  context: Context,
  logger: winston.Logger,
  clientSecrets: ClientSecretsProvider,
  authentication: Authentication,
  bankInterface: FinAPI,
  users: Users.UsersRepository
): Promise<APIGatewayProxyResult> => {
  let body = event.body;
  if (body === null) {
    return CreateSimpleResponse(400, "empty body received");
  }

  let user = JSON.parse(body);

  if (!isUserParams(user)) {
    // TODO report which properties are missing
    return CreateSimpleResponse(400, "request body is incomplete");
  }

  if (!emailRegex.test(user.email)) {
    return CreateSimpleResponse(400, "invalid email given");
  }
  if (!phoneRegex.test(user.phone)) {
    return CreateSimpleResponse(400, "invalid phone given");
  }

  let authorization: string;

  try {
    authorization = await authentication
      .getClientCredentialsToken(clientSecrets)
      .then((token) => CreateAuthHeader(token));
  } catch (err) {
    logger.log("error", "error while authorizing against bank interface", { cause: err });
    return CreateSimpleResponse(401, "could not obtain an authentication token");
  }

  if (await users.findById(user.id)) {
    return CreateSimpleResponse(409, "user already exists");
  }

  try {
    await bankInterface.registerUser(authorization, user);
  } catch (err) {
    logger.log("error", "could not register user", { cause: err });

    // TODO: finAPI specific status code must be mapped to Spanda's status code before thrown
    if (err.response.status === 422) {
      logger.log("debug", "there is a mismatch between server and provider database");
      return CreateSimpleResponse(409, "user already exists");
    } else {
      return CreateInternalErrorResponse("could not perform user registration");
    }
  }

  const username = user.id;
  const email = user.email;
  const phone = user.phone;
  const isAutoUpdateEnabled = user.isAutoUpdateEnabled === true;

  const newUser = new User(username, email, phone, isAutoUpdateEnabled);

  return users.save(newUser).then((userData: User) => CreateResponse(201, userData));
};

// @Post('/oauth/login')
// @BodyProp() username: string,
// @BodyProp() password: string
export const authenticateAndSave = async (
  event: APIGatewayProxyEvent,
  context: Context,
  logger: winston.Logger,
  clientSecrets: ClientSecretsProvider,
  authentication: Authentication
): Promise<APIGatewayProxyResult> => {
  let body = event.body;
  if (body === null) {
    return CreateSimpleResponse(400, "empty body received");
  }

  const credentials: any = JSON.parse(body);

  if (!isPasswordCredentialParams(credentials)) {
    // TODO report which properties are missing
    return CreateSimpleResponse(400, "request body is incomplete");
  }

  const username = credentials.username;
  const password = credentials.password;

  return authentication
    .getPasswordToken(clientSecrets, username, password)
    .then((response: Token) => CreateResponse(200, response))
    .catch((err) => {
      logger.log("error", "could not obtain password token for user " + username, { cause: err });
      return CreateSimpleResponse(401, "unauthorized");
    });
};

// @Post('/oauth/token')
// @BodyProp() refresh_token: string
export const updateRefreshToken = async (
  event: APIGatewayProxyEvent,
  context: Context,
  logger: winston.Logger,
  clientSecrets: ClientSecretsProvider,
  authentication: Authentication,
  bankInterface: FinAPI,
  users: Users.UsersRepository
): Promise<APIGatewayProxyResult> => {
  let body = event.body;
  if (body === null) {
    return CreateSimpleResponse(400, "empty body received");
  }

  const refreshTokenRequest: any = JSON.parse(body);

  if (!isRefreshTokenParams(refreshTokenRequest)) {
    // TODO report which properties are missing
    return CreateSimpleResponse(400, "request body is incomplete");
  }

  let token: Token | null;

  try {
    token = await authentication.getRefreshToken(clientSecrets, refreshTokenRequest.refresh_token);
    if (!token) {
      logger.log("error", "error authenticating user", "acquiring token failed");
      return CreateSimpleResponse(401, "unauthorized");
    }
  } catch (err) {
    logger.log("error", "error authenticating user", err);
    return CreateSimpleResponse(401, "unauthorized");
  }

  try {
    let userInfo = await getUserInfo({ logger, bankInterface }, token.token_type + " " + token.access_token);
    let user: User | null = await users.findById(userInfo.id);
    if (!user) {
      logger.log("error", "error authenticating user", "user is not found in the database.");
      return CreateInternalErrorResponse("internal server error");
    }
    return CreateResponse(200, {
      token: token,
      is_recurrent_transaction_confirmed: user.isRecurrentTransactionConfirmed,
      is_allowance_ready: user.isAllowanceReady,
    });
  } catch (err) {
    logger.log("error", "error authenticating user", err);
    return CreateSimpleResponse(401, "unauthorized");
  }
};
