import { StackProps, Stack, App, Duration, aws_iam, aws_lambda, aws_apigateway, CfnOutput } from "aws-cdk-lib";
import * as path from "path";

import { LambdaFactory } from "./lambda-factory";

export interface MockFinApiProps extends StackProps {
  lambdaEnvironment: { [key: string]: string };
}

export class MockFinApi extends Stack {
  constructor(scope: App, id: string, props?: MockFinApiProps) {
    super(scope, id, props);

    const role = new aws_iam.Role(this, "MockFinAPIMethodLambdaRole", {
      assumedBy: new aws_iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    role.addManagedPolicy(aws_iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"));
    role.addManagedPolicy(aws_iam.ManagedPolicy.fromAwsManagedPolicyName("AWSXRayDaemonWriteAccess"));

    const lambdaFactory = new LambdaFactory({
      scope: this,
      runtime: aws_lambda.Runtime.NODEJS_12_X,
      duration: Duration.seconds(20),
      executionRole: role,
      env: props ? props.lambdaEnvironment : {},
      withTracing: true,
    });

    const restAPI = new aws_apigateway.RestApi(this, "MockFinAPI");

    const apiResource = restAPI.root.addResource("api");
    const apiRoot = apiResource.addResource("v1");

    const asset = aws_lambda.Code.fromAsset(path.join("..", "mock-finapi", "dist", "lambda-mock-finapi"));

    const oauth = restAPI.root.addResource("oauth");
    const token = oauth.addResource("token");
    const getToken = lambdaFactory.createLambda("getToken", asset, "main.getToken");
    token.addMethod("POST", new aws_apigateway.LambdaIntegration(getToken), {
      operationName: "get token",
    });

    const users = apiRoot.addResource("users");
    const userInfo = lambdaFactory.createLambda("userinfo", asset, "main.userinfo");
    users.addMethod("GET", new aws_apigateway.LambdaIntegration(userInfo), {
      operationName: "get user info",
    });
    const createUser = lambdaFactory.createLambda("createUser", asset, "main.createUser");
    users.addMethod("POST", new aws_apigateway.LambdaIntegration(createUser), {
      operationName: "create user",
    });

    const bankConnections = apiRoot.addResource("bankConnections");
    const importBankConnections = bankConnections.addResource("import");
    const importBankConnectionsLambda = lambdaFactory.createLambda(
      "ImportBankConnections",
      asset,
      "main.importBankConnections"
    );
    importBankConnections.addMethod("POST", new aws_apigateway.LambdaIntegration(importBankConnectionsLambda), {
      operationName: "import bank connections",
    });

    const transactions = apiRoot.addResource("transactions");
    const transactionsLambda = lambdaFactory.createLambda("transactions", asset, "main.transactions");
    transactions.addMethod("GET", new aws_apigateway.LambdaIntegration(transactionsLambda), {
      operationName: "get transactions",
    });

    const webForms = apiRoot.addResource("webForms");
    const webForm = webForms.addResource("{webFormId}");
    const webFormLambda = lambdaFactory.createLambda("GetWebFormInfo", asset, "main.webform");
    webForm.addMethod("GET", new aws_apigateway.LambdaIntegration(webFormLambda), {
      operationName: "get webform",
    });

    new CfnOutput(this, "MockFinAPIEndpoint", {
      value: restAPI.url,
    });
  }
}
