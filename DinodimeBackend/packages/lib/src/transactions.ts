import { Repository, PostgresRepository } from "./repository";
import { Schema } from "./schema/schema";
import { Pool } from "pg";
import { Model as FinAPIModel } from "./region-specific/de/model";

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
  /**
   * Maps the finapi json format into database json format
   * @param tx a finAPI Transaction representation.
   */
  // TODO: Time conversion is imprecise
  export const fromFinAPI = (tx: FinAPIModel.Transaction) => {
    return {
      id: tx.id,
      accountId: tx.accountId,
      absAmount: Math.abs(tx.amount),
      isExpense: tx.amount < 0,
      bookingDate: new Date(tx.finapiBookingDate.replace(" ", "T") + "Z"),
      purpose: tx.purpose,
      counterPartName: tx.counterpartName,
      counterPartAccountNumber: tx.counterpartAccountNumber,
      counterPartIban: tx.counterpartIban,
      counterPartBlz: tx.counterpartBlz,
      counterPartBic: tx.counterpartBic,
      counterPartBankName: tx.counterpartBankName
    };
  };

  export interface TransactionsRepository extends Repository<number, Transaction> {
    findByAccountIds(accountIds: Array<number>): Promise<Array<Transaction>>;
    saveArray(transactions: Array<Transaction>): Promise<Array<Transaction>>;
    deleteByAccountId(connectionId: number): Promise<void>;
    groupByIban(accountId: number): Promise<Transaction[][]>;
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

    async delete(transaction: Transaction): Promise<void> {
      delete this.repository[transaction.id];
    }

    async deleteByAccountId(accountId: number): Promise<void> {
      for (let id in this.repository) {
        const tx = this.repository[id];
        if (tx.accountId === accountId) {
          delete this.repository[id];
        }
      }
    }

    async findByIds(ids: Array<number>): Promise<Array<Transaction>> {
      let candidate: Array<Transaction> = [];

      for (let i in ids) {
        const transaction = this.repository[ids[i]];
        if (!transaction) {
          continue;
        }

        candidate.push(transaction);
      }

      return candidate;
    }

    async groupByIban(accountId: number): Promise<Transaction[][]> {
      let indexDictionary: { [iban: string]: number } = {};

      let grouped: Transaction[][] = [];
      for (let id in this.repository) {
        if (this.repository[id].accountId != accountId) {
          continue;
        }

        let currentIban = this.repository[id].counterPartIban;
        if (!currentIban) {
          continue;
        }

        if (indexDictionary[currentIban] == null) {
          indexDictionary[currentIban] = grouped.length;
          grouped.push([]);
          grouped[indexDictionary[currentIban]].push(this.repository[id]);
        } else {
          grouped[indexDictionary[currentIban]].push(this.repository[id]);
        }
      }
      return grouped;
    }

    async deleteAll(): Promise<void> {
      for (let id in this.repository) {
        delete this.repository[id];
      }
    }
  }

  export class PostgreSQLRepository extends PostgresRepository<number, Transaction> implements TransactionsRepository {
    constructor(pool: Pool | undefined, format: (fmt: string, ...args: any[]) => string, schema: Schema<Transaction>) {
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

      return this.doQuery(params).then(res => (res.rowCount > 0 ? this.schema.asObject(res.rows[0]) : null));
    }

    async findByIds(ids: Array<number>): Promise<Array<Transaction>> {
      const params = {
        text: this.findByIdsQuery(ids),
        rowMode: "array",
        types: this.types
      };

      return this.doQuery(params).then(res =>
        res.rowCount > 0
          ? res.rows.map(row => {
              return this.schema.asObject(row);
            })
          : []
      );
    }

    async deleteAll(): Promise<void> {
      const params = {
        text: this.deleteAllQuery()
      };
      await this.doQuery(params);
    }

    async delete(tx: Transaction): Promise<void> {
      const params = {
        text: this.deleteQuery(tx.id)
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

    async groupByIban(accountId: number): Promise<Transaction[][]> {
      const params = {
        text: this.groupByColumnQuery(accountId, 8),
        rowMode: "array",
        types: this.types
      };

      return this.doQuery(params).then(res =>
        res.rows.map(row => row[0].map((element: any) => this.schema.mapColumns(element)))
      );
    }

    async saveArray(transactions: Transaction[]): Promise<Transaction[]> {
      const params = {
        text: this.saveArrayQuery(transactions)
      };

      return this.doQuery(params).then(res => transactions);
    }

    async deleteByAccountId(accountId: number) {
      const params = {
        text: this.deleteByAccountIdQuery(accountId)
      };

      return this.doQuery(params).then(() => undefined);
    }

    findByIdQuery(id: number) {
      const accountIdColumn = this.schema.columns["accountId"];
      return this.format(
        "SELECT * FROM %I WHERE id = %L ORDER BY %s ASC LIMIT 1",
        this.schema.tableName,
        id,
        accountIdColumn
      );
    }

    findByIdsQuery(ids: Array<number>) {
      return this.format("SELECT * FROM %I WHERE id in (%L)", this.schema.tableName, ids);
    }

    findByAccountIdsQuery(accountIds: Array<number>) {
      return this.format("SELECT * FROM %I WHERE accountid in (%L)", this.schema.tableName, accountIds);
    }

    groupByColumnQuery(accountId: number, attributesIndex: number) {
      const attribute = this.schema.attributes[attributesIndex];
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

    deleteByAccountIdQuery(accountId: number) {
      const tableName = this.schema.tableName;
      const idAttribute = this.schema.columns.accountId;
      return this.format("DELETE FROM %I WHERE %I.%I = %L", this.schema.tableName, tableName, idAttribute, accountId);
    }

    deleteQuery(id: number) {
      const tableName = this.schema.tableName;
      const idAttribute = this.schema.columns.id;
      return this.format("DELETE FROM %I WHERE %I.%I = %L", this.schema.tableName, tableName, idAttribute, id);
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
      const values = transactions.map(transaction => this.format("(%L)", this.schema.asRow(transaction))).join(", ");

      return this.format("INSERT INTO %I (%s) VALUES %s", tableName, attributes, values);
    }
  }
}
