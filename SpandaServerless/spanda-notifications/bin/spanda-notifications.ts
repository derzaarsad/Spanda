#!/usr/bin/env node
import cdk = require("@aws-cdk/core");
import { SpandaNotificationsStack } from "../infrastructure/spanda-notifications-stack";

const app = new cdk.App();
new SpandaNotificationsStack(app, "SpandaNotificationsStack");
