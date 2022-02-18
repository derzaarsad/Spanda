import { Duration, aws_apigateway, aws_sqs, aws_iam, aws_lambda, aws_lambda_event_sources } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import { ServicesProps, lambdaEnvironment } from "./services-props";
import { LambdaFactory } from "./lambda-factory";

export class WebFormCallbackAPI extends Construct {
  readonly restAPI: aws_apigateway.RestApi;
  readonly completionsQueue: aws_sqs.Queue;
  readonly completionsDLQ: aws_sqs.Queue;

  constructor(scope: Construct, id: string, props: ServicesProps) {
    super(scope, id);

    const restAPI = new aws_apigateway.RestApi(this, "WebFormCallbackAPI", {
      endpointExportName: "WebFormCallbackAPIEndpoint",
    });

    this.completionsDLQ = new aws_sqs.Queue(this, "WebFormCompletionsDLQ");

    const completionsQueue = new aws_sqs.Queue(this, "WebFormCompletionsQueue", {
      visibilityTimeout: Duration.seconds(120),
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
    webFormCallbackResource.addMethod("POST", webFrontEnd, {
      operationName: "web form callback",
    });

    this.restAPI = restAPI;
    this.completionsQueue = completionsQueue;
  }

  private createWebFrontend(completionsQueue: aws_sqs.Queue, props: ServicesProps): aws_apigateway.LambdaIntegration {
    const env = lambdaEnvironment(props);
    env["QUEUE_URL"] = completionsQueue.queueUrl;

    const callbackRole = new aws_iam.Role(this, "WebFormCallbackLambdaRole", {
      assumedBy: new aws_iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    completionsQueue.grantSendMessages(callbackRole);

    const lambdaFactory = new LambdaFactory({
      scope: this,
      runtime: aws_lambda.Runtime.NODEJS_12_X,
      duration: Duration.seconds(20),
      deploymentProps: props.lambdaDeploymentProps,
      permissionProps: props.lambdaPermissionProps,
      executionRole: callbackRole,
      env: env,
      withTracing: true,
    });

    const handler = aws_lambda.Code.fromAsset(path.join("..", "lambda", "dist", "lambda-webform-callback"));
    const webFormCallback = lambdaFactory.createLambda("WebFormCallback", handler, "main.webFormCallback");
    return new aws_apigateway.LambdaIntegration(webFormCallback);
  }

  private createProcessingBackend(completionsQueue: aws_sqs.Queue, props: ServicesProps): void {
    const env = lambdaEnvironment(props);
    env["QUEUE_URL"] = completionsQueue.queueUrl;

    const processingRole = new aws_iam.Role(this, "WebFormCallbackProcessingLambdaRole", {
      assumedBy: new aws_iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    completionsQueue.grantConsumeMessages(processingRole);

    const lambdaFactory = new LambdaFactory({
      scope: this,
      runtime: aws_lambda.Runtime.NODEJS_12_X,
      duration: Duration.seconds(20),
      deploymentProps: props.lambdaDeploymentProps,
      permissionProps: props.lambdaPermissionProps,
      executionRole: processingRole,
      env: env,
      withTracing: true,
    });

    const handler = aws_lambda.Code.fromAsset(path.join("..", "lambda", "dist", "lambda-webform-callback"));
    const processor = lambdaFactory.createLambda("FetchWebForm", handler, "main.fetchWebForm");

    processor.addEventSource(
      new aws_lambda_event_sources.SqsEventSource(completionsQueue, {
        batchSize: 1,
      })
    );
  }
}
