import { aws_secretsmanager } from "aws-cdk-lib";

export interface PostgresConfiguration {
  pgDatabase: string;
  pgHost: string;
  pgPort: number;
  pgUser: string;
  pgPassword: aws_secretsmanager.Secret;
  storageBackend: "POSTGRESQL";
}
