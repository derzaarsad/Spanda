import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import winston from "winston";
import {
  CreateSimpleResponse,
  CreateResponse,
  HasAuthorization,
  CreateAuthHeader,
  CreateInternalErrorResponse
} from "../lambda-util";

import { Authentication, Encryptions, Token, Transactions } from "dynodime-lib";
import { BankConnection, BankConnections } from "dynodime-lib";
import { User, Users } from "dynodime-lib";
import { ClientSecretsProvider, FinAPI, FinAPIModel } from "dynodime-lib";

const blzPattern = /^\d{8}$/;

const isImportBankConnectionParam = (body: any): body is FinAPIModel.ImportBankConnectionParams => {
  return (body as FinAPIModel.ImportBankConnectionParams).bankId !== undefined;
};

const getUserInfo = async (
  logger: winston.Logger,
  bankInterface: FinAPI,
  authorization: string
) => {
  logger.log("info", "authenticating user", { authorization: authorization });
  return bankInterface.userInfo(authorization);
};

// @Get('/banks/{blz}')
// @Param('blz') blz
export const getBankByBLZ = async (
  event: APIGatewayProxyEvent,
  context: Context,
  logger: winston.Logger,
  clientSecrets: ClientSecretsProvider,
  authentication: Authentication,
  bankInterface: FinAPI
): Promise<APIGatewayProxyResult> => {
  const pathParams = event.pathParameters;

  if (pathParams === null || !pathParams["blz"]) {
    return CreateSimpleResponse(400, "no BLZ given");
  }

  const blz = pathParams["blz"];
  if (!blzPattern.test(blz)) {
    return CreateSimpleResponse(400, "invalid BLZ given");
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

  return bankInterface
    .listBanksByBLZ(authorization, pathParams["blz"])
    .then(response => CreateResponse(200, response))
    .catch(err => {
      // TODO distinguish unauthorized from other errors
      logger.log("error", "error listing banks by BLZ", { cause: err });
      return CreateSimpleResponse(500, "could not list banks");
    });
};

// @Post('/bankConnections/import')
// @Header('Authorization') authorization: string,
// @BodyProp() bankId: number)
export const getWebformId = async (
  event: APIGatewayProxyEvent,
  context: Context,
  logger: winston.Logger,
  bankInterface: FinAPI,
  users: Users.UsersRepository,
  encryptions: Encryptions
): Promise<APIGatewayProxyResult> => {
  const authorization = HasAuthorization(event.headers);

  if (!authorization) {
    return CreateSimpleResponse(401, "unauthorized");
  }

  let user: User | null;

  try {
    let userInfo = await getUserInfo(logger, bankInterface, authorization);
    user = await users.findById(userInfo.id);
    if (!user) {
      throw new Error("user is not found in the database");
    }
  } catch (err) {
    logger.log("error", "error authenticating user", err);
    return CreateSimpleResponse(401, "unauthorized");
  }

  const body = event.body;
  if (body === null) {
    logger.log("error", "empty body in request");
    return CreateSimpleResponse(400, "empty body");
  }

  const params = JSON.parse(body);
  if (!isImportBankConnectionParam(params)) {
    logger.log("error", "invalid request");
    return CreateSimpleResponse(400, "invaild request");
  }

  const response = await bankInterface.importConnection(authorization, params.bankId);
  const secret = encryptions.EncryptText(authorization);

  user.activeWebFormId = response.webFormId;
  user.activeWebFormAuth = secret.iv;

  return users
    .save(user)
    .then(() => {
      /*
       * Client usage: {location}?callbackUrl={RestApi}/webForms/callback/{webFormAuth}
       */
      return CreateResponse(200, {
        location: response.location,
        webFormAuth: response.webFormId + "-" + secret.cipherText
      });
    })
    .catch(err => {
      logger.log("error", "error importing connection", { cause: err });
      return CreateSimpleResponse(500, "could not import connection");
    });
};

// @Get('/webForms/{webFormId}')
// @Param('webId') webId
// @Header('Authorization') authorization: string
export const fetchWebFormInfo = async (
  event: APIGatewayProxyEvent,
  context: Context,
  logger: winston.Logger,
  bankInterface: FinAPI,
  users: Users.UsersRepository,
  connections: BankConnections.BankConnectionsRepository,
  transactions: Transactions.TransactionsRepository,
  encryptions: Encryptions
): Promise<APIGatewayProxyResult> => {
  const pathParameters = event.pathParameters;
  if (pathParameters === null || !pathParameters.webFormAuth) {
    return CreateInternalErrorResponse("no webFormAuth");
  }

  let splitted = pathParameters.webFormAuth.split("-");
  let webId = splitted[0];

  const user = await users.findByWebForm(webId);
  if (user === null || user.activeWebFormAuth === null) {
    logger.log("error", "no user found for webId " + webId);
    return CreateInternalErrorResponse("no user found");
  }

  const authorization = encryptions.DecryptText({
    iv: user.activeWebFormAuth,
    cipherText: splitted[1]
  });

  let webForm: { serviceResponseBody: string };
  try {
    webForm = await bankInterface.fetchWebForm(authorization, webId);
  } catch (err) {
    logger.log("error", "could not fetch web form with id " + webId);
    return CreateInternalErrorResponse("could not fetch web form");
  }

  if (!webForm.serviceResponseBody) {
    logger.log("error", "empty body");
    return CreateInternalErrorResponse("empty body");
  }

  const body = JSON.parse(webForm.serviceResponseBody);
  if (!body.accountIds || body.accountIds.length == 0) {
    logger.log("error", "no accountIds available");
    return CreateInternalErrorResponse("no accountIds available");
  }

  const transactionsData = await bankInterface.getAllTransactions(authorization, body.accountIds);

  const bankConnection = new BankConnection(body.id, body.bankId);
  bankConnection.bankAccountIds = body.accountIds;

  user.bankConnectionIds.push(body.id);

  // TODO: rollback on failure
  return Promise.all([
    users.save(user),
    connections.save(bankConnection),
    transactions.saveArray(transactionsData)
  ])
    .then(() => CreateResponse(200, body))
    .catch(err => {
      logger.log("error", "error persisting bank connection data", { cause: err });
      return CreateInternalErrorResponse("could not persist bank connection data");
    });
};

// @Get('/allowance')
// @Header('Authorization') authorization: string
export const getAllowance = async (
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

  let userInfo: FinAPIModel.User;
  try {
    userInfo = await getUserInfo(logger, bankInterface, authorization);
  } catch (error) {
    logger.log("error", "invalid token", { authorization: authorization });
    return CreateSimpleResponse(401, "unauthorized");
  }

  const username = userInfo.id;
  const user = await users.findById(username);

  if (!user) {
    logger.log("error", "no user found for username " + username);
    return CreateInternalErrorResponse("error fetching allowance");
  }

  return CreateResponse(200, { allowance: user.allowance });
};
