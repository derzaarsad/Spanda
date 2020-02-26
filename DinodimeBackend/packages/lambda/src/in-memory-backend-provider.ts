import { Users } from "dinodime-lib";
import { Transactions } from "dinodime-lib";
import { BankConnections } from "dinodime-lib";
import { RecurrentTransactions } from "dinodime-lib";
import { BackendProvider } from "./backend-provider";

export default class InMemoryBackendProvider implements BackendProvider {
  readonly users: Users.UsersRepository;
  readonly connections: BankConnections.BankConnectionsRepository;
  readonly transactions: Transactions.TransactionsRepository;
  readonly recurrentTransactions: RecurrentTransactions.RecurrentTransactionsRepository;

  constructor() {
    this.users = new Users.InMemoryRepository();
    this.connections = new BankConnections.InMemoryRepository();
    this.transactions = new Transactions.InMemoryRepository();
    this.recurrentTransactions = new RecurrentTransactions.InMemoryRepository();
  }
}
