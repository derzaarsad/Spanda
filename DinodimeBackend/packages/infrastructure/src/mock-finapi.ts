import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigw from "@aws-cdk/aws-apigateway";
import * as iam from "@aws-cdk/aws-iam";
import * as path from "path";

import { Duration } from "@aws-cdk/core";
import { LambdaIntegration } from "@aws-cdk/aws-apigateway";
import { LambdaFactory } from "./lambda-factory";

export interface MockFinApiProps extends cdk.StackProps {
  lambdaEnvironment: { [key: string]: string };
}

export class MockFinApi extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: MockFinApiProps) {
    super(scope, id, props);

    const restAPI = new apigw.RestApi(this, "MockFinAPI");

    const role = new iam.Role(this, "MockFinAPIMethodLambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com")
    });

    const lambdaFactory = new LambdaFactory({
      scope: this,
      runtime: lambda.Runtime.NODEJS_12_X,
      duration: Duration.seconds(20),
      executionRole: role,
      env: props ? props.lambdaEnvironment : {}
    });

    const asset = lambda.Code.asset(path.join("..", "mock-finapi", "dist", "lambda-mock-finapi"));

    const users = restAPI.root.addResource("users");
    const userInfo = lambdaFactory.createLambda("userinfo", asset, "main.userinfo");
    users.addMethod("GET", new LambdaIntegration(userInfo), {
      operationName: "get user info"
    });

    const bankConnections = restAPI.root.addResource("bankConnections");
    const importBankConnections = bankConnections.addResource("import");
    const importBankConnectionsLambda = lambdaFactory.createLambda(
      "ImportBankConnections",
      asset,
      "main.importBankConnections"
    );
    importBankConnections.addMethod("POST", new LambdaIntegration(importBankConnectionsLambda), {
      operationName: "import bank connections"
    });

    const transactions = restAPI.root.addResource("transactions");
    const transactionsLambda = lambdaFactory.createLambda("transactions", asset, "main.transactions");
    transactions.addMethod("GET", new LambdaIntegration(transactionsLambda), {
      operationName: "get transactions"
    });

    const webForms = restAPI.root.addResource("webForms");
    const webForm = webForms.addResource("{webFormId}");
    const webFormLambda = lambdaFactory.createLambda("GetWebFormInfo", asset, "main.webform");
    webForm.addMethod("GET", new LambdaIntegration(webFormLambda), {
      operationName: "get webform"
    });

    new cdk.CfnOutput(this, "MockFinAPIEndpoint", {
      value: restAPI.url
    });
  }
}
