#!/usr/bin/env node
import cdk = require("@aws-cdk/core");
import { DinodimeStack } from "../src/dinodime-stack";

const app = new cdk.App();
new DinodimeStack(app, "DinodimeStack", { env: { region: process.env.CDK_DEPLOY_REGION } });
