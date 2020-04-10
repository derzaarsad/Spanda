import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigw from "@aws-cdk/aws-apigateway";
import * as iam from "@aws-cdk/aws-iam";
import * as path from "path";
import { Duration } from "@aws-cdk/core";
import { LambdaIntegration } from "@aws-cdk/aws-apigateway";
import { LambdaFactory } from "./lambda-factory";
import { ServicesProps, lambdaEnvironment } from "./services-props";

export interface AdminApiProps extends cdk.StackProps {
  lambdaEnvironment: { [key: string]: string };
}

export class AdminApi extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: ServicesProps) {
    super(scope, id, props);

    const restAPI = new apigw.RestApi(this, "AdminAPI");

    const role = new iam.Role(this, "AdminAPIMethodLambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    const lambdaFactory = new LambdaFactory({
      scope: this,
      runtime: lambda.Runtime.NODEJS_12_X,
      duration: Duration.seconds(20),
      deploymentProps: props.lambdaDeploymentProps,
      permissionProps: props.lambdaPermissionProps,
      executionRole: role,
      env: lambdaEnvironment(props),
      withTracing: true,
    });

    const asset = lambda.Code.asset(path.join("..", "lambda", "dist", "lambda-admin-api"));

    const dataResource = restAPI.root.addResource("data");

    const getUserDataMethod = lambdaFactory.createLambda("get-user-data ", asset, "main.getUserData");
    dataResource.addMethod("GET", new LambdaIntegration(getUserDataMethod), {
      operationName: "get user data",
    });

    const deleteDataMethod = lambdaFactory.createLambda("delete-user-data ", asset, "main.deleteUserData");
    dataResource.addMethod("DELETE", new LambdaIntegration(deleteDataMethod), {
      operationName: "delete user data",
    });

    const userResource = restAPI.root.addResource("users");
    const addUserMethod = lambdaFactory.createLambda("add-user ", asset, "main.addUser");
    userResource.addMethod("POST", new LambdaIntegration(addUserMethod), {
      operationName: "add user",
    });

    const deleteUserMethod = lambdaFactory.createLambda("delete-user ", asset, "main.deleteUser");
    userResource.addMethod("DELETE", new LambdaIntegration(deleteUserMethod), {
      operationName: "delete user",
    });

    new cdk.CfnOutput(this, "AdminEndpointURL", {
      value: restAPI.url,
    });
  }
}
