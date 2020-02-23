import { Pool, QueryConfig, QueryResult } from "pg";
import { Schema } from "./schema/schema";
import types from "./schema/types";

export interface Repository<K, T> {
  save(entity: T): Promise<T>;
  findById(id: K): Promise<T | null>;
  findByIds(ids: Array<K>): Promise<Array<T> | null>;
  deleteAll(): Promise<void>;
}

export abstract class PostgresRepository<K, T> implements Repository<K, T> {
  pool: Pool | undefined;
  format: (fmt: string, ...args: any[]) => string;
  schema: Schema<T>;
  types: typeof types;

  constructor(
    pool: Pool | undefined,
    format: (fmt: string, ...args: any[]) => string,
    schema: Schema<T>
  ) {
    this.pool = pool;
    this.format = format;
    this.schema = schema;
    this.types = types;
  }

  abstract save(entity: T): Promise<T>;
  abstract findById(id: K): Promise<T | null>;
  abstract findByIds(ids: Array<K>): Promise<Array<T>>;
  abstract deleteAll(): Promise<void>;

  async doQuery(queryConfig: QueryConfig<any[]>): Promise<QueryResult<any>> {
    if (this.pool === undefined) {
      throw new Error("invalid state: the pool is not initialized");
    }

    const client = await this.pool.connect();
    return client.query(queryConfig).finally(() => {
      client.release();
    });
  }
}
