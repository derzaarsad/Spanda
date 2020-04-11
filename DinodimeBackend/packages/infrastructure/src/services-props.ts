import * as cdk from "@aws-cdk/core";
import { PostgresConfiguration } from "./postgres-configuration";
import { InMemoryConfiguration } from "./in-memory-configuration";
import { FinApiProps } from "./finapi-configuration";
import { LambdaPermissionProps, LambdaDeploymentProps } from "./lambda-factory";
import { FirebaseProps } from "./firebase-configuration";

/**
 * Configuration interface for the services stack.
 */
export interface ServicesProps extends cdk.StackProps {
  loggerLevel?: string;
  finApiProps: FinApiProps;
  backendConfiguration: PostgresConfiguration | InMemoryConfiguration;
  lambdaDeploymentProps: LambdaDeploymentProps;
  lambdaPermissionProps: LambdaPermissionProps;
  firebaseProps: FirebaseProps;
}
