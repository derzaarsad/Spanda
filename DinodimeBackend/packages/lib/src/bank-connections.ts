import DynamoDB from "aws-sdk/clients/dynamodb";
import types from "pg-types";
import { Pool } from "pg";
import { Schema } from "./schema/schema";
import { Repository, PostgresRepository } from "./repository";

export class BankConnection {
  id: number;
  bankId: number;
  bankAccountIds: number[];

  constructor(id: number, bankId: number) {
    this.id = id;
    this.bankId = bankId;
    this.bankAccountIds = [];
  }
}

export namespace BankConnections {
  export interface BankConnectionsRepository extends Repository<number, BankConnection> {}

  export class InMemoryRepository implements BankConnectionsRepository {
    repository: { [key: number]: BankConnection } = {};

    async findById(id: number) {
      return this.repository[id];
    }

    async findByIds(ids: Array<number>): Promise<Array<BankConnection> | null> {

      let candidate = [];

      for (let id in ids) {
        if(!this.repository[id]) {
          continue;
        }

        candidate.push(this.repository[id]);
      }

      return candidate.length > 0 ? candidate : null;
    }

    async save(bankConnection: BankConnection) {
      this.repository[bankConnection.id] = bankConnection;
      return bankConnection;
    }

    async deleteAll() {
      for (let id in this.repository) {
        delete this.repository[id];
      }
    }
  }

  export class DynamoDbRepository implements BankConnectionsRepository {
    private client: DynamoDB;
    private tableName: string;

    constructor(client: DynamoDB, tableName: string) {
      this.client = client;
      this.tableName = tableName;
    }

    private decodeBankConnection(data: DynamoDB.AttributeMap): BankConnection {
      const inputIds = data["bankAccountIds"];

      return {
        id: parseInt(data["id"]!["N"]!),
        bankId: parseInt(data["bankId"]!["N"]!),
        bankAccountIds: inputIds ? data["bankAccountIds"]!["NS"]!.map(id => parseInt(id)) : []
      };
    }

    private encodeBankConnection(
      bankConnection: BankConnection,
      returnValues: string
    ): DynamoDB.UpdateItemInput {
      let expression = "SET #B = :b";

      const attributes: DynamoDB.ExpressionAttributeNameMap = {
        "#B": "bankId"
      };

      const values: DynamoDB.ExpressionAttributeValueMap = {
        ":b": { N: bankConnection.bankId.toString() }
      };

      if (bankConnection.bankAccountIds.length > 0) {
        expression = expression + ", #BA = :ba";
        attributes["#BA"] = "bankAccountIds";
        values[":ba"] = { NS: bankConnection.bankAccountIds.map(id => id.toString()) };
      }

      return {
        Key: {
          id: { N: bankConnection.id.toString() }
        },
        ExpressionAttributeNames: attributes,
        ExpressionAttributeValues: values,
        UpdateExpression: expression,
        ReturnValues: returnValues,
        TableName: this.tableName
      };
    }

    async findById(id: number) {
      const params: DynamoDB.GetItemInput = {
        Key: {
          id: {
            N: id.toString()
          }
        },
        TableName: this.tableName
      };

      return this.client
        .getItem(params)
        .promise()
        .then(data => {
          if (data.Item) {
            return this.decodeBankConnection(data.Item);
          } else {
            return null;
          }
        });
    }

    async findByIds(ids: Array<number>) {
      throw new Error("Method not implemented.");
      return null;
    }

    async save(bankConnection: BankConnection): Promise<BankConnection> {
      const params = this.encodeBankConnection(bankConnection, "NONE");
      return this.client
        .updateItem(params)
        .promise()
        .then(() => bankConnection);
    }

    deleteAll(): Promise<void> {
      throw new Error("Method not implemented.");
    }
  }

  export class PostgreSQLRepository extends PostgresRepository<number, BankConnection>
    implements BankConnectionsRepository {
    constructor(
      pool: Pool | undefined,
      format: (fmt: string, ...args: any[]) => string,
      schema: Schema<BankConnection>
    ) {
      super(pool, format, schema);
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

    deleteAllQuery() {
      return this.format("DELETE FROM %I", this.schema.tableName);
    }

    saveQuery(bankConnection: BankConnection) {
      const tableName = this.schema.tableName;
      const row = this.schema.asRow(bankConnection);
      const attributes = this.schema.attributes;
      const columns = this.schema.columns;

      return this.format(
        "INSERT INTO %I (%s) VALUES (%L) ON CONFLICT (%I) DO UPDATE SET (%s) = (%L) WHERE %I.%I = %L",
        tableName,
        attributes,
        row,
        columns.id,
        attributes,
        row,
        tableName,
        columns.id,
        bankConnection.id
      );
    }

    async findById(id: number): Promise<BankConnection | null> {
      const params = {
        text: this.findByIdQuery(id),
        rowMode: "array",
        types: types
      };

      return this.doQuery(params).then(res =>
        res.rowCount > 0 ? this.schema.asObject(res.rows[0]) : null
      );
    }

    async findByIds(ids: Array<number>): Promise<Array<BankConnection>> {
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

    async save(bankConnection: BankConnection) {
      if (this.pool === undefined) {
        throw "invalid state: the pool is not initialized";
      }

      const client = await this.pool.connect();

      return client
        .query(this.saveQuery(bankConnection))
        .then(() => bankConnection)
        .finally(() => {
          client.release();
        });
    }

    async deleteAll() {
      const params = {
        text: this.deleteAllQuery()
      };

      await this.doQuery(params);
    }
  }
}
