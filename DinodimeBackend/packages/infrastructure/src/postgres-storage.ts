import * as cdk from "@aws-cdk/core";
import * as rds from "@aws-cdk/aws-rds";
import * as ec2 from "@aws-cdk/aws-ec2";

import { PostgresInfrastructureConfiguration } from "./postgres-storage-configuration";
import { ClusterParameterGroup } from "@aws-cdk/aws-rds";

export class PostgresStorage extends cdk.Stack {
  constructor(
    scope: cdk.App,
    id: string,
    infra: PostgresInfrastructureConfiguration,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    const postgres = new rds.DatabaseInstance(this, "DinodimeDatabase", {
      databaseName: "postgres",
      masterUsername: "postgres",
      masterUserPassword: cdk.SecretValue.plainText("covfefe"),
      instanceClass: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
      engine: rds.DatabaseInstanceEngine.POSTGRES,
      deletionProtection: false,
      backupRetention: cdk.Duration.days(0),
      deleteAutomatedBackups: true,
      storageEncrypted: false,
      multiAz: false,
      vpc: infra.vpc,
      vpcPlacement: infra.vpcSubnets
    });

    postgres.connections.allowDefaultPortInternally(
      "Allow incoming connections from security group peers"
    );
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
