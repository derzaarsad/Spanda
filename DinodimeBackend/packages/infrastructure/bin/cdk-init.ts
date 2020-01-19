#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import { Services } from "../src/services";
import { PostgresStorage } from "../src/postgres-storage";
import { Infrastructure } from "../src/infrastructure";
import { PostgresDeploymentProps } from "../src/postgres-deployment-props";

const app = new cdk.App();

const account = app.node.tryGetContext("aws-account")! as string;
const region = app.node.tryGetContext("aws-region")! as string;
const deploymentEnv = { region: region, account: account };

const infrastructure = new Infrastructure(app, "DinodimeInfrastructure", { env: deploymentEnv });

const postgresProps: PostgresDeploymentProps = {
  env: deploymentEnv,

  infrastructureProps: {
    vpc: infrastructure.vpc,
    subnetPlacement: infrastructure.isolatedSubnets(),
    databasePort: infrastructure.databasePort,
    databaseSecurityGroup: infrastructure.databasesSecurityGroup
  },
  instanceProps: {
    databaseName: "postgres",
    masterUsername: "postgres",
    masterUserPassword: cdk.SecretValue.plainText("covfefe"),
    instanceClass: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
    deletionProtection: false,
    backupRetention: cdk.Duration.days(0),
    deleteAutomatedBackups: true,
    storageEncrypted: false,
    multiAz: false
  }
};

new PostgresStorage(app, "DinodimeStorage", postgresProps);
new Services(app, "DinodimeServices", { env: deploymentEnv });
