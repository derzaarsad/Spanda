import * as cdk from "@aws-cdk/core";
import { PostgresConfiguration } from "./postgres-configuration";
import { InMemoryConfiguration } from "./in-memory-configuration";
import { FinApiProps } from "./finapi-configuration";
import { LambdaPermissionProps, LambdaDeploymentProps } from "./lambda-factory";

/**
 * Configuration interface for the services stack.
 */
export interface ServicesProps extends cdk.StackProps {
  loggerLevel?: string;
  finApiProps: FinApiProps;
  backendConfiguration: PostgresConfiguration | InMemoryConfiguration;
  lambdaDeploymentProps: LambdaDeploymentProps;
  lambdaPermissionProps: LambdaPermissionProps;
}

export const lambdaEnvironment = (props: ServicesProps): { [key: string]: string } => {
  const environment: { [key: string]: string } = {
    REGION: props.env?.region || "",
    LOGGER_LEVEL: props.loggerLevel || "debug",
    FINAPI_URL: props.finApiProps.finApiUrl,
    FINAPI_CLIENT_ID: props.finApiProps.finApiClientId,
    FINAPI_CLIENT_SECRET: props.finApiProps.finApiClientSecret,
    FINAPI_DECRYPTION_KEY: props.finApiProps.finApiDecryptionKey,
    FINAPI_TIMEOUT: props.finApiProps.finApiTimeout?.toString() || "3000",
  };

  if (props.backendConfiguration.storageBackend === "POSTGRESQL") {
    environment["PGPASSWORD"] = props.backendConfiguration.pgPassword.secretValue.toString();
    environment["PGUSER"] = props.backendConfiguration.pgUser;
    environment["PGHOST"] = props.backendConfiguration.pgHost;
    environment["PGDATABASE"] = props.backendConfiguration.pgDatabase;
    environment["PGPORT"] = props.backendConfiguration.pgPort.toString();
  }

  environment["STORAGE_BACKEND"] = props.backendConfiguration.storageBackend;

  return environment;
};
