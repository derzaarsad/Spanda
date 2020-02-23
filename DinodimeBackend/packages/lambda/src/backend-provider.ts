import { Users } from "dinodime-lib";
import { BankConnections } from "dinodime-lib";
import { Transactions } from "dinodime-lib";
import { RecurrentTransactions } from "dinodime-lib";

export interface BackendProvider {
  users: Users.UsersRepository;
  connections: BankConnections.BankConnectionsRepository;
  transactions: Transactions.TransactionsRepository;
  recurrentTransactions: RecurrentTransactions.RecurrentTransactionsRepository;
}
