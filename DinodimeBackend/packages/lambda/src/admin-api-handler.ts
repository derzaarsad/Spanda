import winston from "winston";
import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { CreateSimpleResponse, HasAuthorization, CreateInternalErrorResponse } from "./lambda-util";

import { getUserInfo } from "./userinfo";
import { FinAPI, FinAPIModel } from "dinodime-lib";
import { User, Users } from "dinodime-lib";
import { Transactions } from "dinodime-lib";
import { RecurrentTransactions } from "dinodime-lib";
import { BankConnection, BankConnections } from "dinodime-lib";

const badRequest = CreateSimpleResponse(400, "bad request");
const unauthorized = CreateSimpleResponse(401, "unauthorized");

interface AuthenticationConfiguration {
  users: Users.UsersRepository;
  bankInterface: FinAPI;
  logger: winston.Logger;
}

export interface DeleteUserDataHandlerConfiguration extends AuthenticationConfiguration {
  bankConnections: BankConnections.BankConnectionsRepository;
  transactions: Transactions.TransactionsRepository;
  recurrentTransactions: RecurrentTransactions.RecurrentTransactionsRepository;
  logger: winston.Logger;
}

export interface DeleteUserHandlerConfiguration extends AuthenticationConfiguration {}

export const addUserHandler = async (
  configuration: AuthenticationConfiguration,
  event: APIGatewayProxyEvent,
  context: Context
) => {
  const { logger, users } = configuration;

  const body = event.body;

  if (!body) {
    return badRequest;
  }

  const user = JSON.parse(body) as User;

  if (!user) {
    return badRequest;
  }

  try {
    await users.save(user);
  } catch (err) {
    logger.error(`Could not save user ${user.username}`, err);
    return unauthorized;
  }

  logger.info(`User ${user.username} added susccesfully`);
  return CreateSimpleResponse(200, "ok");
};

export const deleteUserHandler = async (
  configuration: DeleteUserHandlerConfiguration,
  event: APIGatewayProxyEvent,
  context: Context
) => {
  const { logger, users } = configuration;

  const user = await getAuthenticatedUser(configuration, event.headers);

  if (!user) {
    return unauthorized;
  }

  try {
    await users.delete(user);
  } catch (err) {
    logger.error(`Could not delete user ${user.username}`, err);
    return unauthorized;
  }

  logger.info(`User ${user.username} deleted susccesfully`);
  return CreateSimpleResponse(200, "ok");
};

export const deleteUserDataHandler = async (
  configuration: DeleteUserDataHandlerConfiguration,
  event: APIGatewayProxyEvent,
  context: Context
) => {
  const { logger, bankConnections, transactions, recurrentTransactions } = configuration;

  const user = await getAuthenticatedUser(configuration, event.headers);

  if (!user) {
    return unauthorized;
  }

  let userConnections: BankConnection[] | undefined;

  try {
    userConnections = await bankConnections.findByIds(user.bankConnectionIds);
  } catch (err) {
    logger.error("error fetching bank connections", err);
    return CreateSimpleResponse(401, "unauthorized");
  }

  try {
    for (let i = 0; userConnections.length; i++) {
      const connection = userConnections[i];
      const bankAccounts = connection.bankAccountIds;

      for (let j = 0; bankAccounts.length; j++) {
        const bankAccountId = bankAccounts[j];
        logger.debug(`Removing transactions from bank account ${bankAccountId}`);
        await transactions.deleteByAccountId(bankAccountId);

        logger.debug(`Removing recurrent transactions associated with ${bankAccountId}`);
        await recurrentTransactions.deleteByAccountId(bankAccountId);
      }

      logger.debug(`Removing bank connection ${connection.id}`);
      await bankConnections.delete(connection);
    }
  } catch (err) {
    logger.error("error removing bank data", err);
    return CreateInternalErrorResponse("error removing bank data");
  }

  logger.info(`Banking data for username ${user.username} deleted susccesfully`);
  return CreateSimpleResponse(200, "ok");
};

const getAuthenticatedUser = async (
  configuration: AuthenticationConfiguration,
  headers: {
    [name: string]: string;
  }
): Promise<User | null> => {
  const { logger, users } = configuration;

  const authorization = HasAuthorization(headers);

  if (!authorization) {
    logger.error("no authorization data in header");
    return null;
  }

  let userInfo: FinAPIModel.User;

  try {
    userInfo = await getUserInfo(configuration, authorization);
  } catch (err) {
    logger.error("error authenticating user against finAPI", err);
    return null;
  }

  let user: User | null;

  try {
    user = await users.findById(userInfo.id);
  } catch (err) {
    logger.error("error fetching user from database", err);
    return null;
  }

  if (!user) {
    logger.error("user authenticated but not found in the database");
    return null;
  }

  return user;
};
