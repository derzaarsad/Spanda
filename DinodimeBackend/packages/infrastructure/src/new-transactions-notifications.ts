import cdk = require("@aws-cdk/core");
import dynamo = require("@aws-cdk/aws-dynamodb");
import sns = require("@aws-cdk/aws-sns");
import subs = require("@aws-cdk/aws-sns-subscriptions");
import sqs = require("@aws-cdk/aws-sqs");
import lambda = require("@aws-cdk/aws-lambda");
import apigw = require("@aws-cdk/aws-apigateway");
import { Duration, RemovalPolicy } from "@aws-cdk/core";
import { NewTransactionsNotificationsConfig } from "./new-transactions-notifications-config";

const tableName = "RuleHandleTable";

export class NewTransactionsNotifications extends cdk.Construct {
  readonly restAPI: apigw.LambdaRestApi;
  readonly notificationsTopic: sns.Topic;
  readonly notificationsQueue: sqs.Queue;
  readonly table: dynamo.Table;

  constructor(scope: cdk.Construct, id: string, props: NewTransactionsNotificationsConfig) {
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

    const fn = new lambda.Function(this, "CallbackHandler", {
      runtime: lambda.Runtime.NODEJS_12_X,
      timeout: Duration.seconds(20),
      code: lambda.Code.asset("../lambda/dist"),
      handler: "notifications-callback.handler",
      environment: {
        TABLE_NAME: tableName,
        TOPIC_ARN: notificationsTopic.topicArn,
        DECRYPTION_KEY: decryptionKey
      }
    });

    table.grantReadData(fn);
    notificationsTopic.grantPublish(fn);

    const restAPI = new apigw.LambdaRestApi(this, "NotificationsEndpoint", {
      handler: fn
    });

    this.restAPI = restAPI;
    this.table = table;
    this.notificationsTopic = notificationsTopic;
    this.notificationsQueue = notifcationsQueue;
  }
}
