import { StackProps } from "aws-cdk-lib";

/**
 * Configuration interface for the infrastructure stack.
 */
export interface InfrastructureProps extends StackProps {
  databasePortNumber?: number;
  sshPortNumber?: number;
  vpcCidr?: string;
  numberOfAzs?: number;
}
