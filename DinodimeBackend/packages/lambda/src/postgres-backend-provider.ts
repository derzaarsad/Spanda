import {
  BankConnections,
  BankConnectionsSchema,
  Users,
  UsersSchema,
  TransactionsSchema,
  Transactions
} from "dinodime-lib";
import { Pool } from "pg";
import format from "pg-format";
import { BackendProvider } from "./backend-provider";

export default class PostgresBackendProvider implements BackendProvider {
  readonly users: Users.UsersRepository;
  readonly connections: BankConnections.BankConnectionsRepository;
  readonly transactions: Transactions.TransactionsRepository;

  constructor(env: NodeJS.ProcessEnv) {
    if (!env["PGUSER"] || !env["PGPASSWORD"]) {
      throw new Error("no credentials are provided for PostgreSQL storage");
    }

    const pool = new Pool();

    this.users = new Users.PostgreSQLRepository(pool, format, new UsersSchema());

    this.connections = new BankConnections.PostgreSQLRepository(
      pool,
      format,
      new BankConnectionsSchema()
    );

    this.transactions = new Transactions.PostgreSQLRepository(
      pool,
      format,
      new TransactionsSchema()
    );
  }
}
