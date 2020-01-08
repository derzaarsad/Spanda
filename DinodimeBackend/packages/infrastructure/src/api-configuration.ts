import { FinApiConfiguration } from "./finapi-configuration";
import { InMemoryConfiguration } from "./in-memory-configuration";
import { PostgresConfiguration } from "./postgres-configuration";

export interface APIConfiguration {
  region: string;
  loggerLevel?: string;
  decryptionKey: string;
  finApiConfiguration: FinApiConfiguration;
  backendConfiguration: PostgresConfiguration | InMemoryConfiguration;
}
