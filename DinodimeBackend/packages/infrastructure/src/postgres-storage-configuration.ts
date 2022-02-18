import { aws_ec2 } from "aws-cdk-lib";

export interface PostgresInfrastructureConfiguration {
  vpc: aws_ec2.Vpc;
  vpcSubnets: aws_ec2.SubnetSelection;
}
