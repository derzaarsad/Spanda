#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";

import { Services } from "../src/services";
import { PostgresStorage } from "../src/postgres-storage";
import { Infrastructure } from "../src/infrastructure";
import { PostgresDeploymentProps } from "../src/postgres-deployment-props";
import { ServicesProps } from "../src/services-props";

const app = new cdk.App();

const account = app.node.tryGetContext("awsAccount")! as string;
const region = app.node.tryGetContext("awsRegion")! as string;
const deploymentEnv = { region: region, account: account };

const infrastructure = new Infrastructure(app, "DinodimeInfrastructure", { env: deploymentEnv });

const pgDatabaseName = app.node.tryGetContext("pgDatabaseName")! as string;
const pgMasterUserName = app.node.tryGetContext("pgMasterUserName")! as string;
const pgMasterPassword = app.node.tryGetContext("pgMasterPassword")! as string;

const postgresProps: PostgresDeploymentProps = {
  env: deploymentEnv,

  infrastructureProps: {
    vpc: infrastructure.vpc,
    subnetPlacement: infrastructure.isolatedSubnetSelection(),
    databasePort: infrastructure.databasePort,
    databaseSecurityGroups: [infrastructure.databasesSecurityGroup]
  },

  instanceProps: {
    databaseName: pgDatabaseName,
    masterUsername: pgMasterUserName,
    masterUserPassword: cdk.SecretValue.plainText(pgMasterPassword),
    instanceClass: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
    deletionProtection: false,
    backupRetention: cdk.Duration.days(0),
    deleteAutomatedBackups: true,
    storageEncrypted: false,
    multiAz: false
  }
};

const storage = new PostgresStorage(app, "DinodimeDatabase", postgresProps);

const servicesProps: ServicesProps = {
  env: deploymentEnv,
  finApiProps: {
    finApiUrl: app.node.tryGetContext("finApiUrl")! as string,
    finApiClientId: app.node.tryGetContext("finApiClientId")! as string,
    finApiClientSecret: app.node.tryGetContext("finApiClientSecret")! as string,
    finApiDecryptionKey: app.node.tryGetContext("finApiDecryptionKey")! as string
  },
  lambdaDeploymentProps: {
    vpc: infrastructure.vpc,
    subnets: infrastructure.privateSubnetSelection(),
    securityGroups: [infrastructure.databaseApplicationsSecurityGroup],
    lambdaExecutionRole: infrastructure.lambdaExecutionRole
  },
  backendConfiguration: {
    pgDatabase: pgDatabaseName,
    pgHost: storage.endpoint().hostname,
    pgPort: infrastructure.databasePortNumber,
    pgUser: pgMasterUserName,
    pgPassword: pgMasterPassword,
    storageBackend: "POSTGRESQL"
  }
};

new Services(app, "DinodimeServices", servicesProps);
