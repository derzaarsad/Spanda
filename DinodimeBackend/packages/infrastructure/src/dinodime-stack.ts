import cdk = require("@aws-cdk/core");
import { NewTransactionsNotifications } from "./new-transactions-notifications";
import { DinodimeAPI } from "./dinodime-api";

export class DinodimeStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const decryptionKey = this.node.tryGetContext("decryptionKey") as string;

    const notifications = new NewTransactionsNotifications(this, "NewTransactionsNotifications", {
      decryptionKey: decryptionKey
    });

    const api = new DinodimeAPI(this, "DynodimeAPI", {
      region: this.region,
      finApiConfiguration: {
        finApiUrl: this.node.tryGetContext("finApiUrl") as string,
        finApiClientId: this.node.tryGetContext("finApiClientId") as string,
        finApiClientSecret: this.node.tryGetContext("finApiClientSecret") as string
      },
      decryptionKey: decryptionKey,
      backendConfiguration: {
        storageBackend: "IN_MEMORY"
      }
    });

    // Outputs

    new cdk.CfnOutput(this, "APIEndpointURL", {
      value: api.restAPI.url
    });

    new cdk.CfnOutput(this, "NotificationsEndpointURL", {
      value: notifications.restAPI.url
    });

    new cdk.CfnOutput(this, "NotificationsTableName", {
      value: notifications.table.tableName
    });

    new cdk.CfnOutput(this, "NotificationsQueueURL", {
      value: notifications.notificationsQueue.queueUrl
    });

    new cdk.CfnOutput(this, "NotificationsTopicARN", {
      value: notifications.notificationsTopic.topicArn
    });
  }
}
