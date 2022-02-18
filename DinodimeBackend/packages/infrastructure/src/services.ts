import { Stack, App, CfnOutput } from "aws-cdk-lib";
import { NewTransactionsNotifications } from "./new-transactions-notifications";
import { DinodimeAPI } from "./dinodime-api";
import { ServicesProps } from "./services-props";
import { WebFormCallbackAPI } from "./webform-callback-api";

export class Services extends Stack {
  constructor(scope: App, id: string, props: ServicesProps) {
    super(scope, id, props);

    const notifications = new NewTransactionsNotifications(this, "DinodimeNewTransactionsNotifications", {
      decryptionKey: props.finApiProps.finApiDecryptionKey,
      lambdaDeploymentProps: props.lambdaDeploymentProps,
      lambdaPermissionProps: props.lambdaPermissionProps,
    });

    const callbackAPI = new WebFormCallbackAPI(this, "DinodimeWebFormCallbackAPI", props);

    const api = new DinodimeAPI(this, "DinodimeAPI", props);

    // Outputs
    new CfnOutput(this, "APIEndpointURL", {
      value: api.restAPI.url,
    });

    new CfnOutput(this, "NotificationsTableName", {
      value: notifications.table.tableName,
    });

    new CfnOutput(this, "NotificationsQueueURL", {
      value: notifications.notificationsQueue.queueUrl,
    });

    new CfnOutput(this, "NotificationsApiEndpointURL", {
      value: notifications.restAPI.url,
    });

    new CfnOutput(this, "NotificationsTopicARN", {
      value: notifications.notificationsTopic.topicArn,
    });

    new CfnOutput(this, "CallbackEndpointURL", {
      value: callbackAPI.restAPI.url,
    });

    new CfnOutput(this, "WebFormCompletionsQueueURL", {
      value: callbackAPI.completionsQueue.queueUrl,
    });

    new CfnOutput(this, "WebFormCompletionsDLQURL", {
      value: callbackAPI.completionsDLQ.queueUrl,
    });
  }
}
