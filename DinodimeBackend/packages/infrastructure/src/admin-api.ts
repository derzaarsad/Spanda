import * as path from "path";
import { Duration, StackProps, Stack, App, aws_apigateway, aws_iam, aws_lambda, CfnOutput } from "aws-cdk-lib";
import { LambdaFactory } from "./lambda-factory";
import { ServicesProps, lambdaEnvironment } from "./services-props";

export interface AdminApiProps extends StackProps {
  lambdaEnvironment: { [key: string]: string };
}

export class AdminApi extends Stack {
  constructor(scope: App, id: string, props: ServicesProps) {
    super(scope, id, props);

    const restAPI = new aws_apigateway.RestApi(this, "AdminAPI");

    const role = new aws_iam.Role(this, "AdminAPIMethodLambdaRole", {
      assumedBy: new aws_iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    const lambdaFactory = new LambdaFactory({
      scope: this,
      runtime: aws_lambda.Runtime.NODEJS_12_X,
      duration: Duration.seconds(20),
      deploymentProps: props.lambdaDeploymentProps,
      permissionProps: props.lambdaPermissionProps,
      executionRole: role,
      env: lambdaEnvironment(props),
      withTracing: true,
    });

    const asset = aws_lambda.Code.fromAsset(path.join("..", "lambda", "dist", "lambda-admin-api"));

    const dataResource = restAPI.root.addResource("data");

    const getUserDataMethod = lambdaFactory.createLambda("get-user-data ", asset, "main.getUserData");
    dataResource.addMethod("GET", new aws_apigateway.LambdaIntegration(getUserDataMethod), {
      operationName: "get user data",
    });

    const deleteDataMethod = lambdaFactory.createLambda("delete-user-data ", asset, "main.deleteUserData");
    dataResource.addMethod("DELETE", new aws_apigateway.LambdaIntegration(deleteDataMethod), {
      operationName: "delete user data",
    });

    const userResource = restAPI.root.addResource("users");
    const addUserMethod = lambdaFactory.createLambda("add-user ", asset, "main.addUser");
    userResource.addMethod("POST", new aws_apigateway.LambdaIntegration(addUserMethod), {
      operationName: "add user",
    });

    const deleteUserMethod = lambdaFactory.createLambda("delete-user ", asset, "main.deleteUser");
    userResource.addMethod("DELETE", new aws_apigateway.LambdaIntegration(deleteUserMethod), {
      operationName: "delete user",
    });

    new CfnOutput(this, "AdminEndpointURL", {
      value: restAPI.url,
    });
  }
}
