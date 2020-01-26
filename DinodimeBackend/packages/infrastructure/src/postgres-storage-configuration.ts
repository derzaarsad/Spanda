import ec2 = require("@aws-cdk/aws-ec2");

export interface PostgresInfrastructureConfiguration {
  vpc: ec2.Vpc;
  vpcSubnets: ec2.SubnetSelection;
}
