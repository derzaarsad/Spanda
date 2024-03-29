import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigw from "@aws-cdk/aws-apigateway";
import * as iam from "@aws-cdk/aws-iam";
import * as path from "path";

import { Duration } from "@aws-cdk/core";
import { LambdaIntegration } from "@aws-cdk/aws-apigateway";
import { LambdaFactory } from "./lambda-factory";
import { ServicesProps, lambdaEnvironment } from "./services-props";

export class DinodimeAPI extends cdk.Construct {
  readonly restAPI: apigw.RestApi;

  constructor(scope: cdk.Construct, id: string, props: ServicesProps) {
    super(scope, id);

    const restAPI = new apigw.RestApi(this, "DinodimeAPI", {
      endpointExportName: "APIEndpointURL",
    });

    this.initializeAppApi(restAPI, props);

    this.restAPI = restAPI;
  }

  private initializeAppApi(restAPI: apigw.RestApi, props: ServicesProps) {
    const environment = lambdaEnvironment(props);

    const role = new iam.Role(this, "APIMethodLambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    const lambdaFactory = new LambdaFactory({
      scope: this,
      runtime: lambda.Runtime.NODEJS_12_X,
      duration: Duration.seconds(20),
      deploymentProps: props.lambdaDeploymentProps,
      permissionProps: props.lambdaPermissionProps,
      executionRole: role,
      env: environment,
    });

    const asset = lambda.Code.asset(path.join("..", "lambda", "dist", "lambda-api"));

    // Authenticaction controller
    const users = restAPI.root.addResource("users");

    const isUserAuthenticated = lambdaFactory.createLambda("IsUserAuthenticated", asset, "main.isUserAuthenticated");

    users.addMethod("GET", new LambdaIntegration(isUserAuthenticated), {
      operationName: "is user authenticated",
    });

    const registerUser = lambdaFactory.createLambda("RegisterUser", asset, "main.registerUser");

    users.addMethod("POST", new LambdaIntegration(registerUser), {
      operationName: "register user",
    });

    const oauth = restAPI.root.addResource("oauth");
    const login = oauth.addResource("login");

    const authenticateAndSaveUser = lambdaFactory.createLambda(
      "AuthenticateAndSaveUser",
      asset,
      "main.authenticateAndSaveUser"
    );

    login.addMethod("POST", new LambdaIntegration(authenticateAndSaveUser), {
      operationName: "authenticate and save user",
    });

    const token = oauth.addResource("token");

    const updateRefreshToken = lambdaFactory.createLambda("UpdateRefreshToken", asset, "main.updateRefreshToken");

    token.addMethod("POST", new LambdaIntegration(updateRefreshToken), {
      operationName: "update fefresh token",
    });

    // Authenticaction controller
    const banks = restAPI.root.addResource("banks");
    const blz = banks.addResource("{blz}");

    const getBankByBLZ = lambdaFactory.createLambda("GetBankByBLZ", asset, "main.getBankByBLZ");

    blz.addMethod("GET", new LambdaIntegration(getBankByBLZ), { operationName: "get bank by BLZ" });

    const bankConnections = restAPI.root.addResource("bankConnections");
    const importBankConnections = bankConnections.addResource("import");

    const getWebFormId = lambdaFactory.createLambda("GetWebFormId", asset, "main.getWebFormId");

    importBankConnections.addMethod("POST", new LambdaIntegration(getWebFormId), {
      operationName: "get webform id",
    });

    const allowance = restAPI.root.addResource("allowance");
    const getAllowance = lambdaFactory.createLambda("GetAllowance", asset, "main.getAllowance");
    allowance.addMethod("GET", new LambdaIntegration(getAllowance), {
      operationName: "get allowance",
    });

    const recurrentTransactions = restAPI.root.addResource("recurrentTransactions");
    const updateRT = recurrentTransactions.addResource("update");

    const getRecurrentTransactions = lambdaFactory.createLambda(
      "GetRecurrentTransactions",
      asset,
      "main.getRecurrentTransactions"
    );
    const updateRecurrentTransactions = lambdaFactory.createLambda(
      "UpdateRecurrentTransactions",
      asset,
      "main.updateRecurrentTransactions"
    );

    recurrentTransactions.addMethod("GET", new LambdaIntegration(getRecurrentTransactions), {
      operationName: "get recurrent transactions",
    });

    updateRT.addMethod("POST", new LambdaIntegration(updateRecurrentTransactions), {
      operationName: "update recurrent transactions",
    });
  }
}
