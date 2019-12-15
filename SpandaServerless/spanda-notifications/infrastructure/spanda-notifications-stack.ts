import sns = require("@aws-cdk/aws-sns");
import subs = require("@aws-cdk/aws-sns-subscriptions");
import sqs = require("@aws-cdk/aws-sqs");
import cdk = require("@aws-cdk/core");
import lambda = require("@aws-cdk/aws-lambda");
import apigw = require("@aws-cdk/aws-apigateway");

export class SpandaNotificationsStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const queue = new sqs.Queue(this, "SpandaNotificationsQueue", {
      visibilityTimeout: cdk.Duration.seconds(300)
    });

    const topic = new sns.Topic(this, "SpandaNotificationsTopic");

    topic.addSubscription(new subs.SqsSubscription(queue));

    const fn = new lambda.Function(this, "CallbackHandler", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset("lambda"),
      handler: "callback.handler"
    });

    topic.grantPublish(fn);

    new apigw.LambdaRestApi(this, "Endpoint", {
      handler: fn
    });
  }
}
