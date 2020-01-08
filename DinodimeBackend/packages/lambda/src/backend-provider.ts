import { Users } from "dynodime-lib";
import { BankConnections } from "dynodime-lib";
import { Transactions } from "dynodime-lib";

export interface BackendProvider {
  users: Users.UsersRepository;
  connections: BankConnections.BankConnectionsRepository;
  transactions: Transactions.TransactionsRepository;
}
