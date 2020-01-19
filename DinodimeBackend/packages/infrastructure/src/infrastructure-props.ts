import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";

/**
 * Configuration interface for the infrastructure stack.
 */
export interface InfrastructureProps extends cdk.StackProps {
  databasePort?: ec2.Port;
  sshPort?: ec2.Port;
  vpcCidr?: string;
  numberOfAzs?: number;
}
