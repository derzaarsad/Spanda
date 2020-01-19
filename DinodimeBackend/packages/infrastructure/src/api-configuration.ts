import { FinApiConfiguration } from "./finapi-configuration";
import { InMemoryConfiguration } from "./in-memory-configuration";
import { PostgresConfiguration } from "./postgres-configuration";
import { LambdaDeploymentProps } from "./lambda-deployment-props";

export interface APIConfiguration {
  region: string;
  loggerLevel?: string;
  decryptionKey: string;
  finApiConfiguration: FinApiConfiguration;
  lambdaDeploymentProps: LambdaDeploymentProps;
  backendConfiguration: PostgresConfiguration | InMemoryConfiguration;
}
