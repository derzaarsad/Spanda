import { Duration, aws_apigateway, aws_iam, aws_lambda } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";

import { LambdaFactory } from "./lambda-factory";
import { ServicesProps, lambdaEnvironment } from "./services-props";

export class DinodimeAPI extends Construct {
  readonly restAPI: aws_apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ServicesProps) {
    super(scope, id);

    const restAPI = new aws_apigateway.RestApi(this, "DinodimeAPI", {
      endpointExportName: "APIEndpointURL",
    });

    this.initializeAppApi(restAPI, props);

    this.restAPI = restAPI;
  }

  private initializeAppApi(restAPI: aws_apigateway.RestApi, props: ServicesProps) {
    const environment = lambdaEnvironment(props);

    const role = new aws_iam.Role(this, "APIMethodLambdaRole", {
      assumedBy: new aws_iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    const lambdaFactory = new LambdaFactory({
      scope: this,
      runtime: aws_lambda.Runtime.NODEJS_12_X,
      duration: Duration.seconds(20),
      deploymentProps: props.lambdaDeploymentProps,
      permissionProps: props.lambdaPermissionProps,
      executionRole: role,
      env: environment,
    });

    const asset = aws_lambda.Code.fromAsset(path.join("..", "lambda", "dist", "lambda-api"));

    // Authenticaction controller
    const users = restAPI.root.addResource("users");

    const isUserAuthenticated = lambdaFactory.createLambda("IsUserAuthenticated", asset, "main.isUserAuthenticated");

    users.addMethod("GET", new aws_apigateway.LambdaIntegration(isUserAuthenticated), {
      operationName: "is user authenticated",
    });

    const registerUser = lambdaFactory.createLambda("RegisterUser", asset, "main.registerUser");

    users.addMethod("POST", new aws_apigateway.LambdaIntegration(registerUser), {
      operationName: "register user",
    });

    const oauth = restAPI.root.addResource("oauth");
    const login = oauth.addResource("login");

    const authenticateAndSaveUser = lambdaFactory.createLambda(
      "AuthenticateAndSaveUser",
      asset,
      "main.authenticateAndSaveUser"
    );

    login.addMethod("POST", new aws_apigateway.LambdaIntegration(authenticateAndSaveUser), {
      operationName: "authenticate and save user",
    });

    const token = oauth.addResource("token");

    const updateRefreshToken = lambdaFactory.createLambda("UpdateRefreshToken", asset, "main.updateRefreshToken");

    token.addMethod("POST", new aws_apigateway.LambdaIntegration(updateRefreshToken), {
      operationName: "update fefresh token",
    });

    // Authenticaction controller
    const banks = restAPI.root.addResource("banks");
    const blz = banks.addResource("{blz}");

    const getBankByBLZ = lambdaFactory.createLambda("GetBankByBLZ", asset, "main.getBankByBLZ");

    blz.addMethod("GET", new aws_apigateway.LambdaIntegration(getBankByBLZ), { operationName: "get bank by BLZ" });

    const bankConnections = restAPI.root.addResource("bankConnections");
    const importBankConnections = bankConnections.addResource("import");

    const getWebFormId = lambdaFactory.createLambda("GetWebFormId", asset, "main.getWebFormId");

    importBankConnections.addMethod("POST", new aws_apigateway.LambdaIntegration(getWebFormId), {
      operationName: "get webform id",
    });

    const allowance = restAPI.root.addResource("allowance");
    const getAllowance = lambdaFactory.createLambda("GetAllowance", asset, "main.getAllowance");
    allowance.addMethod("GET", new aws_apigateway.LambdaIntegration(getAllowance), {
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

    recurrentTransactions.addMethod("GET", new aws_apigateway.LambdaIntegration(getRecurrentTransactions), {
      operationName: "get recurrent transactions",
    });

    updateRT.addMethod("POST", new aws_apigateway.LambdaIntegration(updateRecurrentTransactions), {
      operationName: "update recurrent transactions",
    });
  }
}
