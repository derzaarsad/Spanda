#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import { Services } from "../src/services";
import { PostgresStorage } from "../src/postgres-storage";
import { Infrastructure } from "../src/infrastructure";
import { PostgresInfrastructureConfiguration } from "../src/postgres-storage-configuration";

const app = new cdk.App();

const account = app.node.tryGetContext("aws-account")! as string;
const region = app.node.tryGetContext("aws-region")! as string;

const deploymentEnv = { region: region, account: account };

const infrastructure = new Infrastructure(app, "DinodimeInfrastructure", { env: deploymentEnv });

const vpc = infrastructure.vpc;

const storageInfra: PostgresInfrastructureConfiguration = {
  vpc: vpc,
  vpcSubnets: {
    subnets: vpc.isolatedSubnets
  }
};

new PostgresStorage(app, "DinodimeStorage", storageInfra, { env: deploymentEnv });
new Services(app, "DinodimeServices", { env: deploymentEnv });
