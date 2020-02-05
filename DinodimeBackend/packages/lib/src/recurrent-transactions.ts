import { Repository, PostgresRepository } from "./repository";
import { Schema } from "./schema/schema";
import { Pool } from "pg";

export enum TransactionFrequency {
    Unknown,
    Monthly,
    Quarterly,
    Yearly
}

export class RecurrentTransaction {
  id: number;
  accountId: number;
  transactionIds: number[];
  isExpense: boolean;
  isConfirmed: boolean;
  frequency: TransactionFrequency;

  constructor(
    accountId: number,
    transactionIds: number[],
    isExpense: boolean,
    id?: number
  ) {
      this.id = id ? id : NaN;
      this.accountId = accountId;
      this.transactionIds = transactionIds;
      this.isExpense = isExpense;
      this.isConfirmed = false;
      this.frequency = TransactionFrequency.Unknown;
  }
};

export namespace RecurrentTransactions {

  export interface RecurrentTransactionsRepository extends Repository<number, RecurrentTransaction> {
    findByAccountIds(accountIds: Array<number>): Promise<Array<RecurrentTransaction>>;
    saveArray(recurrentTransactions: Array<RecurrentTransaction>): Promise<Array<RecurrentTransaction>>;
    saveWithoutId(recurrentTransaction: RecurrentTransaction): Promise<RecurrentTransaction>;
  }

  export class InMemoryRepository implements RecurrentTransactionsRepository {
    private repository: { [key: number]: RecurrentTransaction };
    private id_seq: number;

    constructor() {
      this.repository = {};
      this.id_seq = 1;
    }

    async save(transaction: RecurrentTransaction): Promise<RecurrentTransaction> {
      this.repository[transaction.id] = transaction;
      return transaction;
    }

    async saveWithoutId(transaction: RecurrentTransaction): Promise<RecurrentTransaction> {
      this.repository[this.id_seq++] = transaction;
      return transaction;
    }

    async saveArray(recurrentTransactions: Array<RecurrentTransaction>) {
        recurrentTransactions.forEach(recurrentTransaction => this.save(recurrentTransaction));
      return recurrentTransactions;
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

    async findById(id: number): Promise<RecurrentTransaction | null> {
      const candidate = this.repository[id];
      return candidate ? candidate : null;
    }

    async deleteAll(): Promise<void> {
      for (let id in this.repository) {
        delete this.repository[id];
      }
    }
  }

  export class PostgreSQLRepository extends PostgresRepository<number, RecurrentTransaction>
    implements RecurrentTransactionsRepository {
    constructor(
      pool: Pool | undefined,
      format: (fmt: string, ...args: any[]) => string,
      schema: Schema<RecurrentTransaction>
    ) {
      super(pool, format, schema);
    }

    async save(recurrentTransaction: RecurrentTransaction): Promise<RecurrentTransaction> {
      const params = {
        text: this.saveQuery(recurrentTransaction)
      };
      return this.doQuery(params).then(() => recurrentTransaction);
    }

    async saveWithoutId(recurrentTransaction: RecurrentTransaction): Promise<RecurrentTransaction> {
      const params = {
        text: this.saveWithoutIdQuery(recurrentTransaction)
      };
      return this.doQuery(params).then(() => recurrentTransaction);
    }

    async findById(id: number): Promise<RecurrentTransaction | null> {
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

    async findByAccountIds(accountIds: number[]): Promise<RecurrentTransaction[]> {
      const params = {
        text: this.findByAccountIdsQuery(accountIds),
        rowMode: "array",
        types: this.types
      };

      return this.doQuery(params).then(res => res.rows.map(row => this.schema.asObject(row)));
    }

    async groupByIsExpense(): Promise<RecurrentTransaction[][]> {
      const params = {
        text: this.groupByColumnQuery(3),
        rowMode: "array",
        types: this.types
      };

      return this.doQuery(params)
        .then(res => res.rows.map(row => row[0].map((element: any) => this.schema.mapColumns(element))));
    }

    async saveArray(recurrentTransactions: RecurrentTransaction[]): Promise<RecurrentTransaction[]> {
      const params = {
        text: this.saveArrayQuery(recurrentTransactions)
      };

      return this.doQuery(params).then(res => recurrentTransactions);
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

    saveQuery(recurrentTransaction: RecurrentTransaction) {
      const tableName = this.schema.tableName;
      const row = this.schema.asRow(recurrentTransaction);
      const attributes = this.schema.attributes;

      return this.format("INSERT INTO %I (%s) VALUES (%L)", tableName, attributes, row);
    }

    saveWithoutIdQuery(recurrentTransaction: RecurrentTransaction) {
      const tableName = this.schema.tableName;
      const row = this.schema.asRow(recurrentTransaction);
      const attributes = this.schema.attributes.replace("id,","");

      return this.format("INSERT INTO %I (%s) VALUES (%L)", tableName, attributes, row.slice(1));
    }

    saveArrayQuery(recurrentTransactions: RecurrentTransaction[]) {
      const tableName = this.schema.tableName;
      const attributes = this.schema.attributes;
      const values = recurrentTransactions
        .map(recurrentTransaction => {
          return (
            "(" +
            this.schema.asRow(recurrentTransaction).map(item => this.format("%L", item.toString())) +
            ")"
          );
        })
        .join(", ");

      return this.format("INSERT INTO %I (%s) VALUES %s", tableName, attributes, values);
    }
  }
}
