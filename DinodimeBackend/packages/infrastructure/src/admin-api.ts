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
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com")
    });

    const lambdaFactory = new LambdaFactory({
      scope: this,
      runtime: lambda.Runtime.NODEJS_12_X,
      duration: Duration.seconds(20),
      deploymentProps: props.lambdaDeploymentProps,
      permissionProps: props.lambdaPermissionProps,
      executionRole: role,
      env: lambdaEnvironment(props)
    });

    const asset = lambda.Code.asset(path.join("..", "admin-api", "dist", "lambda-admin-api"));

    const dataResource = restAPI.root.addResource("data");
    const deleteMethod = lambdaFactory.createLambda("delete-user-data ", asset, "main.deleteUserData");
    dataResource.addMethod("DELETE", new LambdaIntegration(deleteMethod), {
      operationName: "delete user data"
    });
  }
}
