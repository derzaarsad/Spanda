import * as cdk from "@aws-cdk/core";

/**
 * Configuration interface for the infrastructure stack.
 */
export interface InfrastructureProps extends cdk.StackProps {
  databasePortNumber?: number;
  sshPortNumber?: number;
  vpcCidr?: string;
  numberOfAzs?: number;
}
