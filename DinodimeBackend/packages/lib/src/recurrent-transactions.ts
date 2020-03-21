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
  counterPartName: string | null;

  constructor(
    accountId: number,
    transactionIds: number[],
    isExpense: boolean,
    counterPartName: string | null,
    id?: number
  ) {
      this.id = id ? id : NaN;
      this.accountId = accountId;
      this.transactionIds = transactionIds;
      this.isExpense = isExpense;
      this.isConfirmed = false;
      this.frequency = TransactionFrequency.Unknown;
      this.counterPartName = counterPartName;
  }
};

export namespace RecurrentTransactions {

  export interface RecurrentTransactionsRepository extends Repository<number, RecurrentTransaction> {
    findByAccountIds(accountIds: Array<number>): Promise<Array<RecurrentTransaction>>;
    saveArray(recurrentTransactions: Array<RecurrentTransaction>): Promise<Array<RecurrentTransaction>>;
    saveArrayWithoutId(recurrentTransactions: Array<RecurrentTransaction>): Promise<Array<RecurrentTransaction>>;
    saveWithoutId(recurrentTransaction: RecurrentTransaction): Promise<RecurrentTransaction>;
    updateArray(recurrentTransactions: Array<RecurrentTransaction>): Promise<Array<RecurrentTransaction>>;
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
      transaction.id = this.id_seq;
      this.repository[this.id_seq++] = transaction;
      return transaction;
    }

    async saveArray(recurrentTransactions: Array<RecurrentTransaction>) {
        recurrentTransactions.forEach(recurrentTransaction => this.save(recurrentTransaction));
      return recurrentTransactions;
    }

    async saveArrayWithoutId(recurrentTransactions: Array<RecurrentTransaction>) {
      recurrentTransactions.forEach(recurrentTransaction => this.saveWithoutId(recurrentTransaction));
      return recurrentTransactions;
    }

    async updateArray(recurrentTransactions: Array<RecurrentTransaction>) {
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

    async findByIds(ids: Array<number>): Promise<Array<RecurrentTransaction>> {

      let candidate: Array<RecurrentTransaction> = [];

      for (let i in ids) {
        const recurrentTransaction = this.repository[ids[i]];
        if(!recurrentTransaction) {
          continue;
        }

        candidate.push(recurrentTransaction);
      }

      return candidate;
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

    async findByIds(ids: Array<number>): Promise<Array<RecurrentTransaction>> {
      const params = {
        text: this.findByIdsQuery(ids),
        rowMode: "array",
        types: this.types
      };

      return this.doQuery(params).then(res =>
        res.rowCount > 0 ? res.rows
        .map(row => {
          return this.schema.asObject(row)
        }) : []
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

    async groupByIsExpense(accountId: number): Promise<RecurrentTransaction[][]> {
      const params = {
        text: this.groupByColumnQuery(accountId, 3),
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

    async saveArrayWithoutId(recurrentTransactions: RecurrentTransaction[]): Promise<RecurrentTransaction[]> {
      const params = {
        text: this.saveArrayWithoutIdQuery(recurrentTransactions)
      };

      return this.doQuery(params).then(res => recurrentTransactions);
    }

    async updateArray(recurrentTransactions: RecurrentTransaction[]): Promise<RecurrentTransaction[]> {
      const params = {
        text: this.updateArrayQuery(recurrentTransactions)
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

    findByIdsQuery(ids: Array<number>) {
      return this.format(
        "SELECT * FROM %I WHERE id in (%L)",
        this.schema.tableName,
        ids
      );
    }

    findByAccountIdsQuery(accountIds: Array<number>) {
      return this.format(
        "SELECT * FROM %I WHERE accountid in (%L)",
        this.schema.tableName,
        accountIds
      );
    }

    groupByColumnQuery(accountId: number, attributesIndex: number) {
      const attribute = this.schema.attributes.split(",")[attributesIndex];
      return this.format(
        "SELECT ( SELECT array_to_json(array_agg(t)) from (SELECT * FROM %I WHERE %I=b.%I AND accountid=%L) t ) rw FROM %I b WHERE %I IS NOT NULL GROUP BY %I",
        this.schema.tableName,
        attribute,
        attribute,
        accountId,
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
            this.schema.asRow(recurrentTransaction).map(item => this.format("%L", item != null ? item.toString() : item)) +
            ")"
          );
        })
        .join(", ");

      return this.format("INSERT INTO %I (%s) VALUES %s", tableName, attributes, values);
    }

    saveArrayWithoutIdQuery(recurrentTransactions: RecurrentTransaction[]) {
      const tableName = this.schema.tableName;
      const attributes = this.schema.attributes.replace("id,","");
      const values = recurrentTransactions
        .map(recurrentTransaction => {
          return (
            "(" +
            this.schema.asRow(recurrentTransaction).slice(1).map(item => this.format("%L", item != null ? item.toString() : item)) +
            ")"
          );
        })
        .join(", ");

      return this.format("INSERT INTO %I (%s) VALUES %s", tableName, attributes, values);
    }

    updateArrayQuery(recurrentTransactions: RecurrentTransaction[]) {
      const tableName = this.schema.tableName;
      const attributes = this.schema.attributes;
      const values = recurrentTransactions
        .map(recurrentTransaction => {
          return (
            "(" +
            this.schema.asRow(recurrentTransaction).map(item => this.format("%L", item != null ? item.toString() : item)) +
            ")"
          );
        })
        .join(", ");

      return this.format("UPDATE INTO %I (%s) VALUES %s", tableName, attributes, values);
    }
  }
}
