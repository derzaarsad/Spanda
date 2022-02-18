import { Stack, App, SecretValue, aws_rds, aws_ec2 } from "aws-cdk-lib";

import { PostgresInfrastructureConfiguration } from "./postgres-storage-configuration";
import { PostgresDeploymentProps } from "./postgres-deployment-props";

export class PostgresStorage extends Stack {
  readonly instance: aws_rds.DatabaseInstance;

  constructor(scope: App, id: string, props: PostgresDeploymentProps) {
    super(scope, id, props);

    this.instance = new aws_rds.DatabaseInstance(this, "DinodimeDatabase", {
      engine: aws_rds.DatabaseInstanceEngine.POSTGRES,
      databaseName: props.instanceProps.databaseName,
      credentials: aws_rds.Credentials.fromPassword(props.instanceProps.masterUsername,SecretValue.secretsManager(
        props.instanceProps.masterUserPassword.secretArn
      )),
      instanceType: props.instanceProps.instanceClass,
      deletionProtection: props.instanceProps.deletionProtection,
      backupRetention: props.instanceProps.backupRetention,
      deleteAutomatedBackups: props.instanceProps.deleteAutomatedBackups,
      storageEncrypted: props.instanceProps.storageEncrypted,
      multiAz: props.instanceProps.multiAz,
      vpc: props.infrastructureProps.vpc,
      vpcSubnets: props.infrastructureProps.subnetPlacement,
      securityGroups: [props.infrastructureProps.databaseSecurityGroup]
    });
  }

  endpoint() {
    return this.instance.instanceEndpoint;
  }

  private databaseCluster(infra: PostgresInfrastructureConfiguration) {
    const params = new aws_rds.CfnDBClusterParameterGroup(this, "Params", {
      family: "aurora-postgresql10",
      description: "Postgres parameter group",
      parameters: {
        application_name: "dinodime"
      }
    });

    new aws_rds.DatabaseCluster(this, "DinodimeDatabase", {
      defaultDatabaseName: "postgres",
      instances: 1,
      credentials: aws_rds.Credentials.fromUsername("postgres"),
      engine: aws_rds.DatabaseClusterEngine.AURORA_POSTGRESQL,
      //parameterGroup: params,
      instanceProps: {
        instanceType: aws_ec2.InstanceType.of(aws_ec2.InstanceClass.BURSTABLE2, aws_ec2.InstanceSize.SMALL),
        vpc: infra.vpc,
        vpcSubnets: infra.vpcSubnets
      }
    });
  }
}
