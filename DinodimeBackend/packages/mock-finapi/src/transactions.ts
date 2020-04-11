import { FinAPIModel } from "dinodime-lib";
import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { CreateResponse } from "./lambda-util";
import * as winston from "winston";

const badRequest = CreateResponse(400, "bad request");

export interface TranscationsHandlerConfiguration {
  logger: winston.Logger;
  transactionsPerAccountId: { [key: number]: FinAPIModel.PageableTransactionList };
}

export const transactionsHandler = async (
  configuration: TranscationsHandlerConfiguration,
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const queryStringParameters = event.queryStringParameters;

  if (!queryStringParameters) {
    return badRequest;
  }

  const rawAccountIds = queryStringParameters["accountIds"];

  if (!rawAccountIds) {
    return badRequest;
  }

  const transactions: FinAPIModel.Transaction[] = [];

  rawAccountIds
    .split(",")
    .map(accountId => parseInt(accountId))
    .forEach(accountId => {
      const txForId = configuration.transactionsPerAccountId[accountId];
      if (txForId) {
        txForId.transactions.forEach(tx => transactions.push(tx));
      }
    });

  const income = transactions.filter(tx => tx.amount >= 0).reduce((acc, current) => acc + current.amount, 0);
  const spending = Math.abs(transactions.filter(tx => tx.amount < 0).reduce((acc, current) => acc + current.amount, 0));

  const response: FinAPIModel.PageableTransactionList = {
    transactions: transactions,
    paging: { page: 1, pageCount: 1, perPage: transactions.length, totalCount: transactions.length },
    balance: income - spending,
    income: income,
    spending: spending
  };

  return CreateResponse(200, response);
};
