import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import winston from "winston";
import {
  CreateSimpleResponse,
  CreateResponse,
  HasAuthorization,
  CreateAuthHeader,
  CreateInternalErrorResponse
} from "../lambda-util";

import { Authentication, Encryptions, Transactions } from "dinodime-lib";
import { BankConnection, BankConnections } from "dinodime-lib";
import { User, Users } from "dinodime-lib";
import { ClientSecretsProvider, FinAPI, FinAPIModel } from "dinodime-lib";
import { Transaction } from "dinodime-lib";
import { RecurrentTransaction, RecurrentTransactions } from "dinodime-lib";
import { Algorithm } from "dinodime-lib"

const blzPattern = /^\d{8}$/;

const isImportBankConnectionParam = (body: any): body is FinAPIModel.ImportBankConnectionParams => {
  return (body as FinAPIModel.ImportBankConnectionParams).bankId !== undefined;
};

const getUserInfo = async (
  logger: winston.Logger,
  bankInterface: FinAPI,
  authorization: string
): Promise<FinAPIModel.User> => {
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

// @Get('/recurrentTransactions')
// @Header('Authorization') authorization: string
export const getRecurrentTransactions = async (
  event: APIGatewayProxyEvent,
  context: Context,
  logger: winston.Logger,
  bankInterface: FinAPI,
  users: Users.UsersRepository,
  connections: BankConnections.BankConnectionsRepository,
  recurrentTransactions: RecurrentTransactions.RecurrentTransactionsRepository
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

  let accountIds: Array<number> = [];
  let bankConnections: Array<BankConnection> = [];

  try {
    bankConnections = await connections.findByIds(user.bankConnectionIds);

    if(bankConnections.length == 0) {
      throw new Error("this user does not have any bank connection");
    }
  } catch (err) {
    logger.log("error", "error getting bank connections", err);
    return CreateSimpleResponse(204, "getting bank connections failed");
  }

  for(let id in bankConnections) {
    accountIds = accountIds.concat(bankConnections[id].bankAccountIds);
  }

  let recurrentTransactions_: Array<RecurrentTransaction> = [];
  try {
    recurrentTransactions_ = await recurrentTransactions.findByAccountIds(accountIds);
  } catch (err) {
    logger.log("error", "error getting recurrent transactions", err);
    return CreateSimpleResponse(204, "getting recurrent transactions failed");
  }

  let recurrenttransactions = recurrentTransactions_.map(el => {
    return {
      id: el.id,
      accountId: el.accountId,
      isExpense: el.isExpense,
      isConfirmed: el.isConfirmed,
      frequency: el.frequency,
      counterPartName: el.counterPartName
    }
  });

  return CreateResponse(200, { recurrenttransactions });
};

// @Post('/recurrentTransactions/update')
// @Header('Authorization') authorization: string,
// @BodyProp() recurrenttransactions: [])
export const updateRecurrentTransactions = async (
  event: APIGatewayProxyEvent,
  context: Context,
  logger: winston.Logger,
  bankInterface: FinAPI,
  users: Users.UsersRepository,
  connections: BankConnections.BankConnectionsRepository,
  recurrentTransactions: RecurrentTransactions.RecurrentTransactionsRepository
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
  if (!params.recurrenttransactions) {
    logger.log("error", "invalid request");
    return CreateSimpleResponse(400, "invalid request");
  }

  const recurrentArray: Array<any> = params.recurrenttransactions;

  const recurrenttransactions = recurrentArray.map(el => {
    let ret = new RecurrentTransaction(el.accountId, [], el.isExpense, el.counterPartName, el.id);
    ret.isConfirmed = el.isConfirmed;
    ret.frequency = el.frequency;
    return ret;
  });

  try {
    await recurrentTransactions.updateArray(recurrenttransactions);
  } catch (err) {
    logger.log("error", "error updating recurrent transactions", err);
    return CreateSimpleResponse(204, "updating recurrent transactions failed");
  }

  return CreateResponse(200, "success");
};

export const deduceRecurrentTransactions = async (
  recurrentTransactions: RecurrentTransactions.RecurrentTransactionsRepository,
  transactions: Transactions.TransactionsRepository,
  accountId: number
): Promise<any> => {
  let ibanGroupedTransactions: Transaction[][] = await transactions.groupByIban(accountId);
  let deducedRecurrent: RecurrentTransaction[][] = ibanGroupedTransactions.map(ibanGroupedTransaction =>
    Algorithm.GetRecurrentTransaction(ibanGroupedTransaction).map(res => new RecurrentTransaction(accountId, res.map(el => el.id), res[0].isExpense, res[0].counterPartName == undefined ? null : res[0].counterPartName))
  );
  for(let i = 0; i < deducedRecurrent.length; ++i) {
    await recurrentTransactions.saveArrayWithoutId(deducedRecurrent[i]);
  }
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

  let tokens = pathParameters.webFormAuth.split("-");
  let webFormId = parseInt(tokens[0]);
  let userSecret = tokens[1];

  const user = await users.findByWebFormId(webFormId);
  if (user === null || user.activeWebFormId === null || user.activeWebFormAuth === null) {
    logger.log("error", "no user found for webId " + webFormId);
    return CreateInternalErrorResponse("no user found");
  }

  const authorization = encryptions.DecryptText({
    iv: user.activeWebFormAuth,
    cipherText: userSecret
  });

  let webForm: { serviceResponseBody: string };
  try {
    webForm = await bankInterface.fetchWebForm(authorization, webFormId);
  } catch (err) {
    logger.log("error", "could not fetch web form with web form id " + webFormId);
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

  const transactionsDataBankSpecific = await bankInterface.getAllTransactions(
    authorization,
    body.accountIds
  );

  const transactionsData = transactionsDataBankSpecific.map(transaction =>
    Transactions.fromFinAPI(transaction)
  );

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
