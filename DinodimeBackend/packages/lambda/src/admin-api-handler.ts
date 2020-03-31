import winston from "winston";
import { Context, APIGatewayProxyEvent } from "aws-lambda";
import { CreateSimpleResponse, HasAuthorization, CreateInternalErrorResponse } from "./lambda-util";

import { getUserInfo } from "./userinfo";
import { Authentication, ClientSecretsProvider } from "dinodime-lib";
import { FinAPI } from "dinodime-lib";
import { User, Users } from "dinodime-lib";
import { Transactions } from "dinodime-lib";
import { RecurrentTransactions } from "dinodime-lib";
import { BankConnection, BankConnections } from "dinodime-lib";

export interface DeleteUserDataHandlerConfiguration {
  clientSecrets: ClientSecretsProvider;
  authentication: Authentication;
  bankInterface: FinAPI;
  users: Users.UsersRepository;
  bankConnections: BankConnections.BankConnectionsRepository;
  transactions: Transactions.TransactionsRepository;
  recurrentTransactions: RecurrentTransactions.RecurrentTransactionsRepository;
  logger: winston.Logger;
}

export const deleteUserData = async (
  configuration: DeleteUserDataHandlerConfiguration,
  event: APIGatewayProxyEvent,
  context: Context
) => {
  const { logger, users, bankConnections, transactions, recurrentTransactions, bankInterface } = configuration;
  logger.log("debug", "received event", event);

  const authorization = HasAuthorization(event.headers);

  if (!authorization) {
    return CreateSimpleResponse(401, "unauthorized");
  }

  let user: User | null;

  try {
    let userInfo = await getUserInfo(configuration, authorization);
    user = await users.findById(userInfo.id);
    if (!user) {
      logger.error("user authenticated but not found in the database");
      return CreateSimpleResponse(401, "unauthorized");
    }
  } catch (err) {
    logger.error("error authenticating user", err);
    return CreateSimpleResponse(401, "unauthorized");
  }

  let userConnections: BankConnection[] | undefined;

  try {
    userConnections = await bankConnections.findByIds(user.bankConnectionIds);
  } catch (err) {
    logger.log("error", "error authenticating user", err);
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

  return CreateSimpleResponse(200, "ok");
};
