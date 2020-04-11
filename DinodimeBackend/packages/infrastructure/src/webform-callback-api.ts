import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigw from "@aws-cdk/aws-apigateway";
import * as iam from "@aws-cdk/aws-iam";
import * as sqs from "@aws-cdk/aws-sqs";
import * as path from "path";
import { SqsEventSource } from "@aws-cdk/aws-lambda-event-sources";
import { ServicesProps, lambdaEnvironment } from "./services-props";
import { Duration } from "@aws-cdk/core";
import { LambdaFactory } from "./lambda-factory";

export class WebFormCallbackAPI extends cdk.Construct {
  readonly restAPI: apigw.RestApi;
  readonly completionsQueue: sqs.Queue;
  readonly completionsDLQ: sqs.Queue;

  constructor(scope: cdk.Construct, id: string, props: ServicesProps) {
    super(scope, id);

    const restAPI = new apigw.RestApi(this, "WebFormCallbackAPI", {
      endpointExportName: "WebFormCallbackAPIEndpoint",
    });

    this.completionsDLQ = new sqs.Queue(this, "WebFormCompletionsDLQ");

    const completionsQueue = new sqs.Queue(this, "WebFormCompletionsQueue", {
      visibilityTimeout: cdk.Duration.seconds(120),
      deadLetterQueue: {
        queue: this.completionsDLQ,
        maxReceiveCount: 3,
      },
    });

    this.createProcessingBackend(completionsQueue, props);

    const webForms = restAPI.root.addResource("webForms");
    const callback = webForms.addResource("callback");
    const webFormCallbackResource = callback.addResource("{webFormAuth}");
    const webFrontEnd = this.createWebFrontend(completionsQueue, props);
    webFormCallbackResource.addMethod("GET", webFrontEnd, {
      operationName: "web form callback",
    });

    this.restAPI = restAPI;
    this.completionsQueue = completionsQueue;
  }

  private createWebFrontend(completionsQueue: sqs.Queue, props: ServicesProps): apigw.LambdaIntegration {
    const env = lambdaEnvironment(props);
    env["QUEUE_URL"] = completionsQueue.queueUrl;

    const callbackRole = new iam.Role(this, "WebFormCallbackLambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    completionsQueue.grantSendMessages(callbackRole);

    const lambdaFactory = new LambdaFactory({
      scope: this,
      runtime: lambda.Runtime.NODEJS_12_X,
      duration: Duration.seconds(20),
      deploymentProps: props.lambdaDeploymentProps,
      permissionProps: props.lambdaPermissionProps,
      executionRole: callbackRole,
      env: env,
      withTracing: true,
    });

    const handler = lambda.Code.asset(path.join("..", "lambda", "dist", "lambda-webform-callback"));
    const webFormCallback = lambdaFactory.createLambda("WebFormCallback", handler, "main.webFormCallback");
    return new apigw.LambdaIntegration(webFormCallback);
  }

  private createProcessingBackend(completionsQueue: sqs.Queue, props: ServicesProps): void {
    const env = lambdaEnvironment(props);
    env["QUEUE_URL"] = completionsQueue.queueUrl;

    const processingRole = new iam.Role(this, "WebFormCallbackProcessingLambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    completionsQueue.grantConsumeMessages(processingRole);

    const lambdaFactory = new LambdaFactory({
      scope: this,
      runtime: lambda.Runtime.NODEJS_12_X,
      duration: Duration.seconds(20),
      deploymentProps: props.lambdaDeploymentProps,
      permissionProps: props.lambdaPermissionProps,
      executionRole: processingRole,
      env: env,
      withTracing: true,
    });

    const handler = lambda.Code.asset(path.join("..", "lambda", "dist", "lambda-webform-callback"));
    const processor = lambdaFactory.createLambda("FetchWebForm", handler, "main.fetchWebForm");

    processor.addEventSource(
      new SqsEventSource(completionsQueue, {
        batchSize: 1,
      })
    );
  }
}
