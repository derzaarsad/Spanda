import { Repository, PostgresRepository } from "./repository";
import { Schema } from "./schema/schema";
import { Pool } from "pg";

export type Transaction = {
  id: number;
  accountId: number;
  absAmount: number;
  isExpense: boolean;
  bookingDate: Date;
  purpose: string | undefined;
  counterPartName: string | undefined;
  counterPartAccountNumber: string | undefined;
  counterPartIban: string | undefined;
  counterPartBlz: string | undefined;
  counterPartBic: string | undefined;
  counterPartBankName: string | undefined;
};

export namespace Transactions {
  export interface TransactionsRepository extends Repository<number, Transaction> {
    findByAccountIds(accountIds: Array<number>): Promise<Array<Transaction>>;
    saveArray(transactions: Array<Transaction>): Promise<Array<Transaction>>;
  }

  export class InMemoryRepository implements TransactionsRepository {
    private repository: { [key: number]: Transaction };

    constructor() {
      this.repository = {};
    }

    async save(transaction: Transaction): Promise<Transaction> {
      this.repository[transaction.id] = transaction;
      return transaction;
    }

    async saveArray(transactions: Array<Transaction>) {
      transactions.forEach(transaction => this.save(transaction));
      return transactions;
    }

    async findByAccountIds(accountIds: Array<number>) {
      return Object.keys(this.repository)
        .filter(index => {
          const key = parseInt(index);
          return accountIds.includes(this.repository[key].accountId);
        })
        .map(index => {
          const key = parseInt(index);
          return this.repository[key];
        });
    }

    async findById(id: number): Promise<Transaction | null> {
      const candidate = this.repository[id];
      return candidate ? candidate : null;
    }

    async deleteAll(): Promise<void> {
      for (let id in this.repository) {
        delete this.repository[id];
      }
    }
  }

  export class PostgreSQLRepository extends PostgresRepository<number, Transaction>
    implements TransactionsRepository {
    constructor(
      pool: Pool | undefined,
      format: (fmt: string, ...args: any[]) => string,
      schema: Schema<Transaction>
    ) {
      super(pool, format, schema);
    }

    async save(transaction: Transaction): Promise<Transaction> {
      const params = {
        text: this.saveQuery(transaction)
      };
      return this.doQuery(params).then(() => transaction);
    }

    async findById(id: number): Promise<Transaction | null> {
      const params = {
        text: this.findByIdQuery(id),
        rowMode: "array",
        types: this.types
      };

      return this.doQuery(params).then(res =>
        res.rowCount > 0 ? this.schema.asObject(res.rows[0]) : null
      );
    }

    async deleteAll(): Promise<void> {
      const params = {
        text: this.deleteAllQuery()
      };
      await this.doQuery(params);
    }

    async findByAccountIds(accountIds: number[]): Promise<Transaction[]> {
      const params = {
        text: this.findByAccountIdsQuery(accountIds),
        rowMode: "array",
        types: this.types
      };

      return this.doQuery(params).then(res => res.rows.map(row => this.schema.asObject(row)));
    }

    async groupByIban(): Promise<any> {
      const params = {
        text: this.groupByColumnQuery(8),
        rowMode: "array",
        types: this.types
      };

      return this.doQuery(params)
        .then(res => res.rows.map(row => row[0].map((element: any) => this.schema.mapColumns(element))));
    }

    async saveArray(transactions: Transaction[]): Promise<Transaction[]> {
      const params = {
        text: this.saveArrayQuery(transactions)
      };

      return this.doQuery(params).then(res => transactions);
    }

    findByIdQuery(id: number) {
      return this.format(
        "SELECT * FROM %I WHERE id = %L LIMIT 1",
        this.schema.tableName,
        id.toString()
      );
    }

    findByAccountIdsQuery(accountIds: Array<number>) {
      return this.format(
        "SELECT * FROM %I WHERE accountid in (%L)",
        this.schema.tableName,
        accountIds
      );
    }

    groupByColumnQuery(attributesIndex: number) {
      const attribute = this.schema.attributes.split(",")[attributesIndex];
      return this.format(
        "SELECT ( SELECT array_to_json(array_agg(t)) from (SELECT * FROM %I WHERE %I=b.%I) t ) rw FROM %I b WHERE %I IS NOT NULL GROUP BY %I",
        this.schema.tableName,
        attribute,
        attribute,
        this.schema.tableName,
        attribute,
        attribute
      );
    }

    deleteAllQuery() {
      return this.format("DELETE FROM %I", this.schema.tableName);
    }

    saveQuery(transaction: Transaction) {
      const tableName = this.schema.tableName;
      const row = this.schema.asRow(transaction);
      const attributes = this.schema.attributes;

      return this.format("INSERT INTO %I (%s) VALUES (%L)", tableName, attributes, row);
    }

    saveArrayQuery(transactions: Transaction[]) {
      const tableName = this.schema.tableName;
      const attributes = this.schema.attributes;
      const values = transactions
        .map(transaction => {
          return (
            "(" +
            this.schema.asRow(transaction).map(item => this.format("%L", item.toString())) +
            ")"
          );
        })
        .join(", ");

      return this.format("INSERT INTO %I (%s) VALUES %s", tableName, attributes, values);
    }
  }
}
