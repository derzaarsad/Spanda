import * as sm from "@aws-cdk/aws-secretsmanager";

export interface PostgresConfiguration {
  pgDatabase: string;
  pgHost: string;
  pgPort: number;
  pgUser: string;
  pgPassword: sm.Secret;
  storageBackend: "POSTGRESQL";
}
