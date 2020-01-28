import * as cdk from "@aws-cdk/core";
import * as dynamo from "@aws-cdk/aws-dynamodb";
import * as sns from "@aws-cdk/aws-sns";
import * as subs from "@aws-cdk/aws-sns-subscriptions";
import * as sqs from "@aws-cdk/aws-sqs";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigw from "@aws-cdk/aws-apigateway";
import * as iam from "@aws-cdk/aws-iam";

import { Duration, RemovalPolicy } from "@aws-cdk/core";
import { NewTransactionsNotificationsProps } from "./new-transactions-notifications-config";
import { LambdaFactory } from "./lambda-factory";

const tableName = "RuleHandleTable";

export class NewTransactionsNotifications extends cdk.Construct {
  readonly restAPI: apigw.LambdaRestApi;
  readonly notificationsTopic: sns.Topic;
  readonly notificationsQueue: sqs.Queue;
  readonly table: dynamo.Table;

  constructor(scope: cdk.Construct, id: string, props: NewTransactionsNotificationsProps) {
    super(scope, id);

    const decryptionKey = props.decryptionKey;

    const table = new dynamo.Table(this, tableName, {
      tableName: tableName,
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: {
        name: "id",
        type: dynamo.AttributeType.STRING
      }
    });

    const notifcationsQueue = new sqs.Queue(this, "NotificationsQueue", {
      visibilityTimeout: cdk.Duration.seconds(300)
    });

    const notificationsTopic = new sns.Topic(this, "NotificationsTopic");
    notificationsTopic.addSubscription(new subs.SqsSubscription(notifcationsQueue));

    const role = new iam.Role(this, "NewTransactionsNotificationLambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com")
    });

    const lambdaFactory = new LambdaFactory({
      scope: this,
      runtime: lambda.Runtime.NODEJS_12_X,
      duration: Duration.seconds(20),
      deploymentProps: props.lambdaDeploymentProps,
      permissionProps: props.lambdaPermissionProps,
      executionRole: role,
      env: {
        TABLE_NAME: tableName,
        TOPIC_ARN: notificationsTopic.topicArn,
        DECRYPTION_KEY: decryptionKey
      }
    });

    const fn = lambdaFactory.createLambda(
      "CallbackHandler",
      lambda.Code.asset("../lambda/dist"),
      "notifications-callback.handler"
    );

    table.grantReadData(fn);
    notificationsTopic.grantPublish(fn);

    const restAPI = new apigw.LambdaRestApi(this, "NotificationsEndpoint", {
      handler: fn,
      endpointExportName: "NotificationsEndpointURL"
    });

    this.restAPI = restAPI;
    this.table = table;
    this.notificationsTopic = notificationsTopic;
    this.notificationsQueue = notifcationsQueue;
  }
}
