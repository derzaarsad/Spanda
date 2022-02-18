import { aws_ec2, aws_secretsmanager, aws_iam, aws_ecr, Duration, StackProps } from "aws-cdk-lib";

interface PostgresInfrastructureProps {
  vpc: aws_ec2.Vpc;
  subnetPlacement: aws_ec2.SubnetSelection;
  databasePort: aws_ec2.Port;
  databaseSecurityGroup: aws_ec2.SecurityGroup;
}

interface PostgresInstanceProps {
  databaseName: string;
  masterUsername: string;
  masterUserPassword: aws_secretsmanager.Secret;
  instanceClass: aws_ec2.InstanceType;
  deletionProtection: boolean;
  backupRetention: Duration;
  deleteAutomatedBackups: boolean;
  storageEncrypted: boolean;
  multiAz: boolean;
}

interface MigrationsContainerProps {
  subnetPlacement: aws_ec2.SubnetSelection;
  securityGroup: aws_ec2.SecurityGroup;
  imageRepository: aws_ecr.IRepository;
  databasePassword: aws_secretsmanager.Secret;
  imageTag?: string;
  lambdaManagedPolicies: aws_iam.IManagedPolicy[];
}

/**
 * Configuration interface for the postgres stack.
 */
export interface PostgresDeploymentProps extends StackProps {
  infrastructureProps: PostgresInfrastructureProps;
  migrationsContainerProps: MigrationsContainerProps;
  instanceProps: PostgresInstanceProps;
}
