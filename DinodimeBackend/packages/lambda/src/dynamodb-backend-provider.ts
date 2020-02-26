import DynamoDB from "aws-sdk/clients/dynamodb";
import { Users } from "dinodime-lib";
import { BankConnections } from "dinodime-lib";
import { Transactions } from "dinodime-lib";
import { RecurrentTransactions } from "dinodime-lib";
import { BackendProvider } from "./backend-provider";

export default class DynamoDBBackendProvider implements BackendProvider {
  readonly users: Users.UsersRepository;
  readonly connections: BankConnections.BankConnectionsRepository;
  readonly transactions: Transactions.TransactionsRepository;
  readonly recurrentTransactions: RecurrentTransactions.RecurrentTransactionsRepository;

  constructor(env: NodeJS.ProcessEnv) {
    const usersTableName = env["USERS_TABLE_NAME"];
    const connectionsTableName = env["BANK_CONNECTIONS_TABLE_NAME"];

    if (usersTableName === undefined || connectionsTableName === undefined) {
      throw new Error("DynamoDB table names not defined");
    }

    const client = new DynamoDB({ apiVersion: "2012-08-10", region: env["REGION"] });
    this.users = new Users.DynamoDbRepository(client, usersTableName);
    this.connections = new BankConnections.DynamoDbRepository(client, connectionsTableName);
    this.transactions = {} as Transactions.TransactionsRepository;
    this.recurrentTransactions = {} as RecurrentTransactions.RecurrentTransactionsRepository;
  }
}
