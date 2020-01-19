import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as rds from "@aws-cdk/aws-rds";

interface PostgresInfrastructureProps {
  vpc: ec2.Vpc;
  subnetPlacement: ec2.SubnetSelection;
  databasePort: ec2.Port;
  databaseSecurityGroups: ec2.SecurityGroup[];
}

interface PostgresInstanceProps {
  databaseName: string;
  masterUsername: string;
  masterUserPassword: cdk.SecretValue;
  instanceClass: ec2.InstanceType;
  deletionProtection: boolean;
  backupRetention: cdk.Duration;
  deleteAutomatedBackups: boolean;
  storageEncrypted: boolean;
  multiAz: boolean;
}

/**
 * Configuration interface for the postgres stack.
 */
export interface PostgresDeploymentProps extends cdk.StackProps {
  infrastructureProps: PostgresInfrastructureProps;
  instanceProps: PostgresInstanceProps;
}
