import DynamoDB from "aws-sdk/clients/dynamodb";
import { Repository, PostgresRepository } from "./repository";
import { Schema } from "./schema/schema";
import { Pool } from "pg";

export class User {
  username: string;
  allowance: number;
  isAllowanceReady: boolean;
  email: string;
  phone: string;
  isAutoUpdateEnabled: boolean;
  bankConnectionIds: number[];
  activeWebFormId: number | null;
  activeWebFormAuth: string | null;
  creationDate: Date;

  constructor(
    username: string,
    email: string,
    phone: string,
    isAutoUpdateEnabled: boolean = false
  ) {
    this.username = username;
    this.email = email;
    this.phone = phone;
    this.isAutoUpdateEnabled = isAutoUpdateEnabled;
    this.isAllowanceReady = false;
    this.bankConnectionIds = [];
    this.activeWebFormId = null;
    this.activeWebFormAuth = null;
    this.allowance = 0;
    this.creationDate = new Date();
  }
}

export namespace Users {
  export interface UsersRepository extends Repository<string, User> {
    findByWebFormId(activeWebFormId: number): Promise<User | null>;
  }

  export class InMemoryRepository implements UsersRepository {
    private repository: { [key: string]: User };

    constructor() {
      this.repository = {};
    }

    async findById(username: string) {
      const candidate = this.repository[username];
      return candidate ? candidate : null;
    }

    async findByIds(usernames: Array<string>): Promise<Array<User> | null> {

      let candidate = [];

      for (let id in usernames) {
        if(!this.repository[id]) {
          continue;
        }

        candidate.push(this.repository[id]);
      }

      return candidate.length > 0 ? candidate : null;
    }

    async findByWebFormId(activeWebFormId: number) {
      for (let key in this.repository) {
        const currentUser = this.repository[key];
        if (currentUser.activeWebFormId == activeWebFormId) {
          return currentUser;
        }
      }

      return null;
    }

    async save(user: User) {
      this.repository[user.username] = user;
      return user;
    }

    async deleteAll() {
      for (let key in this.repository) {
        delete this.repository[key];
      }
    }
  }

  export class DynamoDbRepository implements UsersRepository {
    private client: DynamoDB;
    private tableName: string;

    constructor(client: DynamoDB, tableName: string) {
      this.client = client;
      this.tableName = tableName;
    }

    async findById(username: string) {
      const params = {
        Key: {
          username: {
            S: username
          }
        },
        TableName: this.tableName
      };

      return this.client
        .getItem(params)
        .promise()
        .then(data => {
          if (data.Item) {
            return this.decodeUser(data.Item);
          } else {
            return null;
          }
        });
    }

    async findByIds(usernames: Array<string>) {
      throw new Error("Method not implemented.");
      return null;
    }

    async save(user: User) {
      const params = this.encodeUser(user);

      return this.client
        .putItem(params)
        .promise()
        .then(() => user);
    }

    async findByWebFormId(activeWebFormId: number): Promise<User | null> {
      throw new Error("Method not implemented.");
    }

    async deleteAll(): Promise<void> {
      throw new Error("Method not implemented.");
    }

    private decodeUser(data: DynamoDB.AttributeMap) {
      const bankConnectionIds = data["bankConnectionIds"];
      const activeWebFormId = data["activeWebFormId"];
      const activeWebFormAuth = data["activeWebFormAuth"];

      const user: User = {
        username: data["username"]!["S"]!,
        allowance: parseFloat(data["allowance"]!["N"]!),
        isAllowanceReady: data["isAllowanceReady"]!["BOOL"]!,
        creationDate: new Date(data["creationDate"]!["N"]!),
        email: data["email"]!["S"]!,
        phone: data["phone"]!["S"]!,
        isAutoUpdateEnabled: data["isAutoUpdateEnabled"]!["BOOL"]!,
        activeWebFormAuth: activeWebFormId !== undefined ? activeWebFormAuth["S"]! : null,
        activeWebFormId: activeWebFormAuth !== undefined ? parseInt(activeWebFormId["N"]!) : null,
        bankConnectionIds:
          bankConnectionIds !== undefined ? bankConnectionIds["NS"]!.map(id => parseInt(id)) : []
      };

      return user;
    }

    private encodeUser(user: User, returnConsumedCapacity: string = "NONE"): DynamoDB.PutItemInput {
      const values: DynamoDB.ExpressionAttributeValueMap = {
        allowance: { N: user.allowance.toString() },
        isAllowanceReady: { BOOL: user.isAllowanceReady },
        email: { S: user.email },
        phone: { S: user.phone },
        isAutoUpdateEnabled: { BOOL: user.isAutoUpdateEnabled },
        creationDate: { N: user.creationDate.valueOf().toString() }
      };

      if (user.bankConnectionIds.length > 0) {
        values["bankConnectionIds"] = { NS: user.bankConnectionIds.map(id => id.toString()) };
      }

      if (user.activeWebFormAuth) {
        values["activeWebFormAuth"] = { S: user.activeWebFormAuth };
      }

      if (user.activeWebFormId) {
        values["activeWebFormId"] = { N: user.activeWebFormId.toString() };
      }

      return {
        Item: values,
        ReturnConsumedCapacity: returnConsumedCapacity,
        TableName: this.tableName
      };
    }
  }

  export class PostgreSQLRepository extends PostgresRepository<string, User>
    implements UsersRepository {
    constructor(
      pool: Pool | undefined,
      format: (fmt: string, ...args: any[]) => string,
      schema: Schema<User>
    ) {
      super(pool, format, schema);
    }

    findByIdQuery(userName: string) {
      return this.format(
        "SELECT * FROM %I WHERE username = %L LIMIT 1",
        this.schema.tableName,
        userName
      );
    }

    findByIdsQuery(userNames: Array<string>) {
      return this.format(
        "SELECT * FROM %I WHERE username in (%L)",
        this.schema.tableName,
        userNames
      );
    }

    findByWebFormIdQuery(activeWebFormId: number) {
      return this.format(
        "SELECT * FROM %I WHERE activewebformid = %L LIMIT 1",
        this.schema.tableName,
        activeWebFormId
      );
    }

    deleteAllQuery() {
      return this.format("DELETE FROM %I", this.schema.tableName);
    }

    saveQuery(user: User) {
      const tableName = this.schema.tableName;
      const attributes = this.schema.attributes;
      const columns = this.schema.columns;
      const row = this.schema.asRow(user);

      return this.format(
        "INSERT INTO %I (%s) VALUES (%L) ON CONFLICT (%I) DO UPDATE SET (%s) = (%L) WHERE %I.%I = %L",
        tableName,
        attributes,
        row,
        columns.username,
        attributes,
        row,
        tableName,
        columns.username,
        user.username
      );
    }

    async findById(username: string) {
      const params = {
        text: this.findByIdQuery(username),
        rowMode: "array"
      };

      return this.doQuery(params).then(res =>
        res.rowCount > 0 ? this.schema.asObject(res.rows[0]) : null
      );
    }

    async findByIds(usernames: Array<string>): Promise<Array<User> | null> {
      const params = {
        text: this.findByIdsQuery(usernames),
        rowMode: "array",
        types: this.types
      };

      return this.doQuery(params).then(res =>
        res.rowCount > 0 ? res.rows
        .map(row => {
          return this.schema.asObject(row)
        }) : null
      );
    }

    async findByWebFormId(activeWebFormId: number) {
      const params = {
        text: this.findByWebFormIdQuery(activeWebFormId),
        rowMode: "array"
      };

      return this.doQuery(params).then(res =>
        res.rowCount > 0 ? this.schema.asObject(res.rows[0]) : null
      );
    }

    async save(user: User) {
      const params = {
        text: this.saveQuery(user)
      };

      return this.doQuery(params).then(() => user);
    }

    async deleteAll() {
      const params = {
        text: this.deleteAllQuery()
      };

      await this.doQuery(params);
    }
  }
}
