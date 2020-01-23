import * as cdk from "@aws-cdk/core";
import { PostgresConfiguration } from "./postgres-configuration";
import { InMemoryConfiguration } from "./in-memory-configuration";
import { LambdaDeploymentProps } from "./lambda-deployment-props";
import { FinApiProps } from "./finapi-configuration";

/**
 * Configuration interface for the services stack.
 */
export interface ServicesProps extends cdk.StackProps {
  loggerLevel?: string;
  finApiProps: FinApiProps;
  backendConfiguration: PostgresConfiguration | InMemoryConfiguration;
  lambdaDeploymentProps: LambdaDeploymentProps;
}
