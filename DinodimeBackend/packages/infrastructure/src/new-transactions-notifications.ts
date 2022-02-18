import { Duration, RemovalPolicy, aws_apigateway, aws_sns, aws_lambda, aws_iam, aws_sqs, aws_sns_subscriptions, aws_dynamodb } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";

import { LambdaFactory } from "./lambda-factory";

const tableName = "RuleHandleTable";

import { LambdaDeploymentProps, LambdaPermissionProps } from "./lambda-factory";

export interface NewTransactionsNotificationsProps {
  decryptionKey: string;
  lambdaDeploymentProps: LambdaDeploymentProps;
  lambdaPermissionProps: LambdaPermissionProps;
}

export class NewTransactionsNotifications extends Construct {
  readonly restAPI: aws_apigateway.LambdaRestApi;
  readonly notificationsTopic: aws_sns.Topic;
  readonly notificationsQueue: aws_sqs.Queue;
  readonly table: aws_dynamodb.Table;

  constructor(scope: Construct, id: string, props: NewTransactionsNotificationsProps) {
    super(scope, id);

    const decryptionKey = props.decryptionKey;

    const table = new aws_dynamodb.Table(this, tableName, {
      tableName: tableName,
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: {
        name: "id",
        type: aws_dynamodb.AttributeType.STRING
      }
    });

    const notifcationsQueue = new aws_sqs.Queue(this, "NotificationsQueue", {
      visibilityTimeout: Duration.seconds(300)
    });

    const notificationsTopic = new aws_sns.Topic(this, "NotificationsTopic");
    notificationsTopic.addSubscription(new aws_sns_subscriptions.SqsSubscription(notifcationsQueue));

    const role = new aws_iam.Role(this, "NewTransactionsNotificationLambdaRole", {
      assumedBy: new aws_iam.ServicePrincipal("lambda.amazonaws.com")
    });

    const lambdaFactory = new LambdaFactory({
      scope: this,
      runtime: aws_lambda.Runtime.NODEJS_12_X,
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
      aws_lambda.Code.fromAsset(path.join("..", "lambda", "dist", "lambda-notifications-callback")),
      "main.handler"
    );

    table.grantReadData(fn);
    notificationsTopic.grantPublish(fn);

    const restAPI = new aws_apigateway.LambdaRestApi(this, "NotificationsEndpoint", {
      handler: fn,
      endpointExportName: "NotificationsEndpointURL"
    });

    this.restAPI = restAPI;
    this.table = table;
    this.notificationsTopic = notificationsTopic;
    this.notificationsQueue = notifcationsQueue;
  }
}
