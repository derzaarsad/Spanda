#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";

import { Services } from "../src/services";
import { PostgresStorage } from "../src/postgres-storage";
import { Infrastructure } from "../src/infrastructure";
import { PostgresDeploymentProps } from "../src/postgres-deployment-props";
import { ServicesProps } from "../src/services-props";
import { DatabaseMigrationsRepository } from "../src/db-migrations-repo";
import { LambdaPermissionProps } from "../src/lambda-factory";
import { MockFinApi } from "../src/mock-finapi";
import { AdminApi } from "../src/admin-api";

const app = new cdk.App();

const account = app.node.tryGetContext("awsAccount")! as string;
const region = app.node.tryGetContext("awsRegion")! as string;
const deploymentEnv = { region: region, account: account };

const migrationsRepository = new DatabaseMigrationsRepository(app, "DinodimeDbMigrationsRepository", {
  env: deploymentEnv
});

const infrastructure = new Infrastructure(app, "DinodimeInfrastructure", { env: deploymentEnv });

const pgDatabaseName = app.node.tryGetContext("pgDatabaseName")! as string;
const pgMasterUserName = app.node.tryGetContext("pgMasterUserName")! as string;

const postgresProps: PostgresDeploymentProps = {
  env: deploymentEnv,

  infrastructureProps: {
    vpc: infrastructure.vpc,
    subnetPlacement: infrastructure.isolatedSubnetSelection(),
    databasePort: infrastructure.databasePort,
    databaseSecurityGroup: infrastructure.databasesSecurityGroup
  },

  instanceProps: {
    databaseName: pgDatabaseName,
    masterUsername: pgMasterUserName,
    masterUserPassword: infrastructure.databasePassword,
    instanceClass: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
    deletionProtection: false,
    backupRetention: cdk.Duration.days(0),
    deleteAutomatedBackups: true,
    storageEncrypted: false,
    multiAz: false
  },

  migrationsContainerProps: {
    subnetPlacement: infrastructure.privateSubnetSelection(),
    databasePassword: infrastructure.databasePassword,
    lambdaManagedPolicies: infrastructure.lambdaManagedPolicies,
    imageRepository: migrationsRepository.repository,
    securityGroup: infrastructure.databaseApplicationsSecurityGroup,
    imageTag: "latest"
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
    securityGroups: [infrastructure.databaseApplicationsSecurityGroup]
  },
  lambdaPermissionProps: new LambdaPermissionProps(infrastructure.lambdaManagedPolicies),
  backendConfiguration: {
    pgDatabase: pgDatabaseName,
    pgHost: storage.endpoint().hostname,
    pgPort: infrastructure.databasePortNumber,
    pgUser: pgMasterUserName,
    pgPassword: infrastructure.databasePassword,
    storageBackend: "POSTGRESQL"
  }
};

new Services(app, "DinodimeServices", servicesProps);

new MockFinApi(app, "MockFinAPI");

new AdminApi(app, "DinodimeAdminAPI", servicesProps);
