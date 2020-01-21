import * as iam from "@aws-cdk/aws-iam";
import * as ec2 from "@aws-cdk/aws-ec2";

/**
 * Configuration interface for services stacks deploying lambda functions.
 */
export interface LambdaDeploymentProps {
  vpc?: ec2.Vpc;
  subnets?: ec2.SubnetSelection;
  securityGroups?: ec2.SecurityGroup[];
  lambdaExecutionRole?: iam.Role;
}
