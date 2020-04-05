import { Repository, PostgresRepository } from "./repository";
import { Schema } from "./schema/schema";
import { Pool } from "pg";

export enum TransactionFrequency {
  Unknown = "Unknown",
  Monthly = "Monthly",
  Quarterly = "Quarterly",
  Yearly = "Yearly"
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
    this.id = id ? id : 0;
    this.accountId = accountId;
    this.transactionIds = transactionIds;
    this.isExpense = isExpense;
    this.isConfirmed = false;
    this.frequency = TransactionFrequency.Unknown;
    this.counterPartName = counterPartName;
  }
}

export namespace RecurrentTransactions {
  export interface RecurrentTransactionsRepository extends Repository<number, RecurrentTransaction> {
    findByAccountIds(accountIds: Array<number>): Promise<Array<RecurrentTransaction>>;
    saveArray(recurrentTransactions: Array<RecurrentTransaction>): Promise<Array<RecurrentTransaction>>;
    saveArrayWithoutId(recurrentTransactions: Array<RecurrentTransaction>): Promise<Array<RecurrentTransaction>>;
    saveWithoutId(recurrentTransaction: RecurrentTransaction): Promise<RecurrentTransaction>;
    updateArray(recurrentTransactions: Array<RecurrentTransaction>): Promise<Array<RecurrentTransaction>>;
    deleteByAccountId(accountId: number): Promise<void>;
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
      recurrentTransactions.forEach(recurrentTransaction => {
        this.repository[recurrentTransaction.id].isConfirmed = recurrentTransaction.isConfirmed;
        this.repository[recurrentTransaction.id].frequency = recurrentTransaction.frequency;
      });
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
        if (!recurrentTransaction) {
          continue;
        }

        candidate.push(recurrentTransaction);
      }

      return candidate;
    }

    async delete(tx: RecurrentTransaction) {
      delete this.repository[tx.id];
    }

    async deleteAll(): Promise<void> {
      for (let id in this.repository) {
        delete this.repository[id];
      }
    }

    async deleteByAccountId(accountId: number) {
      for (let id in this.repository) {
        const tx = this.repository[id];
        if (tx.accountId === accountId) {
          delete this.repository[id];
        }
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

    async saveWithoutId(tx: RecurrentTransaction): Promise<RecurrentTransaction> {
      const params = {
        text: this.saveWithoutIdQuery(tx)
      };
      return this.doQuery(params).then(res => {
        return this.cloneRecurrentTransaction(tx, res.rows[0].id as number);
      });
    }

    async findById(id: number): Promise<RecurrentTransaction | null> {
      const params = {
        text: this.findByIdQuery(id),
        rowMode: "array",
        types: this.types
      };

      return this.doQuery(params).then(res => (res.rowCount > 0 ? this.schema.asObject(res.rows[0]) : null));
    }

    async findByIds(ids: Array<number>): Promise<Array<RecurrentTransaction>> {
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

    deleteQuery(id: number) {
      const tableName = this.schema.tableName;
      const idAttribute = this.schema.columns.id;
      return this.format("DELETE FROM %I WHERE %I.%I = %L", this.schema.tableName, tableName, idAttribute, id);
    }

    async delete(tx: RecurrentTransaction): Promise<void> {
      const params = {
        text: this.deleteQuery(tx.id)
      };
      await this.doQuery(params);
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

      return this.doQuery(params).then(res =>
        res.rows.map(row => row[0].map((element: any) => this.schema.mapColumns(element)))
      );
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

      return this.doQuery(params).then(res => {
        const result = [];
        for (let i = 0; i < res.rowCount; i++) {
          const newIndex = res.rows[i].id as number;
          result.push(this.cloneRecurrentTransaction(recurrentTransactions[i], newIndex));
        }
        return result;
      });
    }

    async updateArray(recurrentTransactions: RecurrentTransaction[]): Promise<RecurrentTransaction[]> {
      if (recurrentTransactions.length === 0) {
        return recurrentTransactions;
      }

      const existingTransactions = await this.findByIds(recurrentTransactions.map(tx => tx.id));

      if (existingTransactions.length !== recurrentTransactions.length) {
        throw new Error("Cannot perform update. Some transactions don't exist.");
      }

      const params = {
        text: this.updateArrayQuery(recurrentTransactions)
      };

      return this.doQuery(params).then(res => recurrentTransactions);
    }

    async deleteByAccountId(accountId: number) {
      const params = {
        text: this.deleteByAccountIdQuery(accountId)
      };
      await this.doQuery(params);
    }

    findByIdQuery(id: number) {
      return this.format("SELECT * FROM %I WHERE id = %L LIMIT 1", this.schema.tableName, id.toString());
    }

    findByIdsQuery(ids: Array<number>) {
      const idAttribute = this.schema.columns["id"];
      return this.format("SELECT * FROM %I WHERE id in (%L) ORDER BY %s ASC", this.schema.tableName, ids, idAttribute);
    }

    findByAccountIdsQuery(accountIds: Array<number>) {
      const idAttribute = this.schema.columns["id"];
      return this.format(
        "SELECT * FROM %I WHERE accountid in (%L) ORDER BY %s ASC",
        this.schema.tableName,
        accountIds,
        idAttribute
      );
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
      const attributes = this.schema.attributes.slice(1).join(",");
      const idAttribute = this.schema.attributes[0];
      const row = this.schema.asRow(recurrentTransaction).slice(1);
      return this.format("INSERT INTO %I (%s) VALUES (%L) RETURNING %s", tableName, attributes, row, idAttribute);
    }

    saveArrayQuery(recurrentTransactions: RecurrentTransaction[]) {
      const tableName = this.schema.tableName;
      const attributes = this.schema.attributes;
      const values = recurrentTransactions
        .map(recurrentTransaction => {
          return (
            "(" +
            this.schema
              .asRow(recurrentTransaction)
              .map(item => this.format("%L", item != null ? item.toString() : item)) +
            ")"
          );
        })
        .join(", ");

      return this.format("INSERT INTO %I (%s) VALUES %s", tableName, attributes, values);
    }

    saveArrayWithoutIdQuery(recurrentTransactions: RecurrentTransaction[]) {
      const tableName = this.schema.tableName;
      const idAttribute = this.schema.attributes[0];
      const attributes = this.schema.attributes.slice(1);
      const values = recurrentTransactions
        .map(recurrentTransaction => {
          return (
            "(" +
            this.schema
              .asRow(recurrentTransaction)
              .slice(1)
              .map(item => this.format("%L", item != null ? item.toString() : item)) +
            ")"
          );
        })
        .join(", ");

      return this.format("INSERT INTO %I (%s) VALUES %s RETURNING %s", tableName, attributes, values, idAttribute);
    }

    updateArrayQuery(recurrentTransactions: RecurrentTransaction[]) {
      const tableName = this.schema.tableName;
      const attributes = this.schema.attributes;
      const values = recurrentTransactions
        .map(recurrentTransaction => {
          return (
            "(" +
            this.schema
              .asRow(recurrentTransaction)
              .map(item => this.format("%L", item != null ? item.toString() : item)) +
            ")"
          );
        })
        .join(", ");

      return this.format(
        "UPDATE %I SET isconfirmed = nv.isconfirmed::boolean, frequency = nv.frequency::transactionfrequency FROM ( VALUES %s) as nv (%s) WHERE recurrenttransactions.id = nv.id::int8 AND recurrenttransactions.accountid = nv.accountid::int8",
        tableName,
        values,
        attributes
      );
    }

    deleteByAccountIdQuery(bankAccountId: number) {
      const tableName = this.schema.tableName;
      const bankAccountIdAttribute = this.schema.columns.accountId;
      return this.format(
        "DELETE FROM %I WHERE %I.%I = %L",
        this.schema.tableName,
        tableName,
        bankAccountIdAttribute,
        bankAccountId
      );
    }

    private cloneRecurrentTransaction(tx: RecurrentTransaction, id: number) {
      const result = new RecurrentTransaction(tx.accountId, tx.transactionIds, tx.isExpense, tx.counterPartName, id);
      result.isConfirmed = tx.isConfirmed;
      result.frequency = tx.frequency;
      return result;
    }
  }
}
