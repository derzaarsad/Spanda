export interface PostgresConfiguration {
  pgDatabase: string;
  pgHost: string;
  pgPort: number;
  pgUser: string;
  pgPassword: string;
  storageBackend: "POSTGRESQL";
}
