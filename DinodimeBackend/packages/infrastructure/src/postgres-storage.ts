import * as cdk from "@aws-cdk/core";
import * as rds from "@aws-cdk/aws-rds";
import * as ec2 from "@aws-cdk/aws-ec2";

import { PostgresInfrastructureConfiguration } from "./postgres-storage-configuration";
import { ClusterParameterGroup } from "@aws-cdk/aws-rds";
import { PostgresDeploymentProps } from "./postgres-deployment-props";

export class PostgresStorage extends cdk.Stack {
  readonly instance: rds.DatabaseInstance;

  constructor(scope: cdk.App, id: string, props: PostgresDeploymentProps) {
    super(scope, id, props);

    this.instance = new rds.DatabaseInstance(this, "DinodimeDatabase", {
      engine: rds.DatabaseInstanceEngine.POSTGRES,
      databaseName: props.instanceProps.databaseName,
      masterUsername: props.instanceProps.masterUsername,
      masterUserPassword: props.instanceProps.masterUserPassword,
      instanceClass: props.instanceProps.instanceClass,
      deletionProtection: props.instanceProps.deletionProtection,
      backupRetention: props.instanceProps.backupRetention,
      deleteAutomatedBackups: props.instanceProps.deleteAutomatedBackups,
      storageEncrypted: props.instanceProps.storageEncrypted,
      multiAz: props.instanceProps.multiAz,
      vpc: props.infrastructureProps.vpc,
      vpcPlacement: props.infrastructureProps.subnetPlacement,
      securityGroups: props.infrastructureProps.databaseSecurityGroups
    });
  }

  endpoint() {
    return this.instance.instanceEndpoint;
  }

  private databaseCluster(infra: PostgresInfrastructureConfiguration) {
    const params = new ClusterParameterGroup(this, "Params", {
      family: "aurora-postgresql10",
      description: "Postgres parameter group",
      parameters: {
        application_name: "dinodime"
      }
    });

    new rds.DatabaseCluster(this, "DinodimeDatabase", {
      defaultDatabaseName: "postgres",
      instances: 1,
      masterUser: {
        username: "postgres"
      },
      engine: rds.DatabaseClusterEngine.AURORA_POSTGRESQL,
      parameterGroup: params,
      instanceProps: {
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.SMALL),
        vpc: infra.vpc,
        vpcSubnets: infra.vpcSubnets
      }
    });
  }
}
