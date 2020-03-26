import * as cdk from "@aws-cdk/core";
import { NewTransactionsNotifications } from "./new-transactions-notifications";
import { DinodimeAPI } from "./dinodime-api";
import { ServicesProps } from "./services-props";
import { WebFormCallbackAPI } from "./webform-callback-api";

export class Services extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: ServicesProps) {
    super(scope, id, props);

    const notifications = new NewTransactionsNotifications(
      this,
      "DinodimeNewTransactionsNotifications",
      {
        decryptionKey: props.finApiProps.finApiDecryptionKey,
        lambdaDeploymentProps: props.lambdaDeploymentProps,
        lambdaPermissionProps: props.lambdaPermissionProps
      }
    );

    new DinodimeAPI(this, "DinodimeAPI", props);

    new WebFormCallbackAPI(this, "DinodimeWebFormCallbackAPI", props);

    // Outputs
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
