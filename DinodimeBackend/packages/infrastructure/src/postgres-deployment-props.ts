import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecr from "@aws-cdk/aws-ecr";

interface PostgresInfrastructureProps {
  vpc: ec2.Vpc;
  subnetPlacement: ec2.SubnetSelection;
  databasePort: ec2.Port;
  databaseSecurityGroup: ec2.SecurityGroup;
}

interface PostgresInstanceProps {
  databaseName: string;
  masterUsername: string;
  masterUserPassword: string;
  instanceClass: ec2.InstanceType;
  deletionProtection: boolean;
  backupRetention: cdk.Duration;
  deleteAutomatedBackups: boolean;
  storageEncrypted: boolean;
  multiAz: boolean;
}

interface MigrationsContainerProps {
  subnetPlacement: ec2.SubnetSelection;
  securityGroup: ec2.SecurityGroup;
  imageRepository: ecr.IRepository;
  imageTag?: string;
}

/**
 * Configuration interface for the postgres stack.
 */
export interface PostgresDeploymentProps extends cdk.StackProps {
  infrastructureProps: PostgresInfrastructureProps;
  migrationsContainerProps: MigrationsContainerProps;
  instanceProps: PostgresInstanceProps;
}
