import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import winston from "winston";
import {
  CreateSimpleResponse,
  CreateResponse,
  HasAuthorization,
  HasMissingProperty,
  CreateAuthHeader
} from "../lambda-util";

import { Authentication, Token } from "dinodime-lib";
import { User, Users } from "dinodime-lib";
import { ClientSecretsProvider, FinAPI, FinAPIModel } from "dinodime-lib";

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
  bankInterface: FinAPI
): Promise<APIGatewayProxyResult> => {
  const authorization = HasAuthorization(event.headers);

  if (!authorization) {
    return CreateSimpleResponse(401, "unauthorized");
  }

  return bankInterface
    .userInfo(authorization)
    .then((response: FinAPIModel.User) => CreateResponse(200, response))
    .catch(err => {
      logger.log("error", "error authenticating user", err);
      return CreateSimpleResponse(401, "unauthorized");
    });
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
  logger.log("debug", "received event", event.body);

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
      .then(token => CreateAuthHeader(token));
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
      return CreateSimpleResponse(500, "could not perform user registration");
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
  logger.log("debug", "received event", event);

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
    .catch(err => {
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
  authentication: Authentication
): Promise<APIGatewayProxyResult> => {
  logger.log("debug", "received event", event.body);

  let body = event.body;
  if (body === null) {
    return CreateSimpleResponse(400, "empty body received");
  }

  const refreshTokenRequest: any = JSON.parse(body);

  if (!isRefreshTokenParams(refreshTokenRequest)) {
    // TODO report which properties are missing
    return CreateSimpleResponse(400, "request body is incomplete");
  }

  return authentication
    .getRefreshToken(clientSecrets, refreshTokenRequest.refresh_token)
    .then((response: Token) => CreateResponse(200, response))
    .catch(err => {
      logger.log("error", "could not obtain refresh token", { cause: err });
      return CreateSimpleResponse(401, "unauthorized");
    });
};