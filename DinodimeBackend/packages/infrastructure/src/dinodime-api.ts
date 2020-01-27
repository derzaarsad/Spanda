import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigw from "@aws-cdk/aws-apigateway";
import * as iam from "@aws-cdk/aws-iam";

import { Duration } from "@aws-cdk/core";
import { LambdaIntegration } from "@aws-cdk/aws-apigateway";
import { LambdaFactory } from "./lambda-factory";
import { ServicesProps } from "./services-props";

const configureEnvironment = (servicesProps: ServicesProps): { [key: string]: string } => {
  const environment: { [key: string]: string } = {
    REGION: servicesProps.env?.region || "",
    LOGGER_LEVEL: servicesProps.loggerLevel || "debug",
    FINAPI_URL: servicesProps.finApiProps.finApiUrl,
    FINAPI_CLIENT_ID: servicesProps.finApiProps.finApiClientId,
    FINAPI_CLIENT_SECRET: servicesProps.finApiProps.finApiClientSecret,
    FINAPI_TIMEOUT: servicesProps.finApiProps.finApiTimeout?.toString() || "3000"
  };

  if (servicesProps.backendConfiguration.storageBackend === "POSTGRESQL") {
    environment["PGPASSWORD"] = servicesProps.backendConfiguration.pgPassword;
    environment["PGUSER"] = servicesProps.backendConfiguration.pgUser;
    environment["PGHOST"] = servicesProps.backendConfiguration.pgHost;
    environment["PGDATABASE"] = servicesProps.backendConfiguration.pgDatabase;
    environment["PGPORT"] = servicesProps.backendConfiguration.pgPort.toString();
  }

  environment["STORAGE_BACKEND"] = servicesProps.backendConfiguration.storageBackend;

  return environment;
};

export class DinodimeAPI extends cdk.Construct {
  readonly restAPI: apigw.RestApi;

  constructor(scope: cdk.Construct, id: string, props: ServicesProps) {
    super(scope, id);

    const commonEnvironment = configureEnvironment(props);

    const role = new iam.Role(this, "APIMethodLambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: props.lambdaDeploymentProps.managedPolicies
    });

    const lambdaFactory = new LambdaFactory({
      scope: this,
      runtime: lambda.Runtime.NODEJS_12_X,
      duration: Duration.seconds(20),
      deploymentProps: props.lambdaDeploymentProps,
      executionRole: role,
      env: commonEnvironment
    });

    const restAPI = new apigw.RestApi(this, "DinodimeAPI", {
      endpointExportName: "APIEndpointURL"
    });

    // Authenticaction controller
    const users = restAPI.root.addResource("users");

    const isUserAuthenticated = lambdaFactory.createLambda(
      "IsUserAuthenticated",
      lambda.Code.asset("../lambda/dist"),
      "api.isUserAuthenticated"
    );

    users.addMethod("GET", new LambdaIntegration(isUserAuthenticated), {
      operationName: "is user authenticated"
    });

    const registerUser = lambdaFactory.createLambda(
      "RegisterUser",
      lambda.Code.asset("../lambda/dist"),
      "api.registerUser"
    );

    users.addMethod("POST", new LambdaIntegration(registerUser), {
      operationName: "register user"
    });

    const oauth = restAPI.root.addResource("oauth");
    const login = oauth.addResource("login");

    const authenticateAndSaveUser = lambdaFactory.createLambda(
      "AuthenticateAndSaveUser",
      lambda.Code.asset("../lambda/dist"),
      "api.authenticateAndSaveUser"
    );

    login.addMethod("POST", new LambdaIntegration(authenticateAndSaveUser), {
      operationName: "authenticate and save user"
    });

    const token = oauth.addResource("token");

    const updateRefreshToken = lambdaFactory.createLambda(
      "UpdateRefreshToken",
      lambda.Code.asset("../lambda/dist"),
      "api.updateRefreshToken"
    );

    token.addMethod("POST", new LambdaIntegration(updateRefreshToken), {
      operationName: "update fefresh token"
    });

    // Authenticaction controller

    const banks = restAPI.root.addResource("banks");
    const blz = banks.addResource("{blz}");

    const getBankByBLZ = lambdaFactory.createLambda(
      "GetBankByBLZ",
      lambda.Code.asset("../lambda/dist"),
      "api.getBankByBLZ"
    );

    blz.addMethod("GET", new LambdaIntegration(getBankByBLZ), { operationName: "get bank by BLZ" });

    const bankConnections = restAPI.root.addResource("bankConnections");
    const importBankConnections = bankConnections.addResource("import");

    const getWebFormId = lambdaFactory.createLambda(
      "GetWebFormId",
      lambda.Code.asset("../lambda/dist"),
      "api.getWebFormId"
    );

    importBankConnections.addMethod("POST", new LambdaIntegration(getWebFormId), {
      operationName: "get webform id"
    });

    const webForms = restAPI.root.addResource("webForms");
    const callback = webForms.addResource("callback");
    const webFormCallbackResource = callback.addResource("{webFormAuth}");

    const webFormCallback = lambdaFactory.createLambda(
      "WebFormCallback",
      lambda.Code.asset("../lambda/dist"),
      "api.webFormCallback"
    );

    webFormCallbackResource.addMethod("POST", new LambdaIntegration(webFormCallback), {
      operationName: "web form callback"
    });

    const webForm = webForms.addResource("{webFormId}");

    const getWebFormInfo = lambdaFactory.createLambda(
      "GetWebFormInfo",
      lambda.Code.asset("../lambda/dist"),
      "api.getWebFormInfo"
    );

    webForm.addMethod("GET", new LambdaIntegration(getWebFormInfo), {
      operationName: "get webform info"
    });

    const allowance = restAPI.root.addResource("allowance");

    const getAllowance = lambdaFactory.createLambda(
      "GetAllowance",
      lambda.Code.asset("../lambda/dist"),
      "api.getAllowance"
    );

    allowance.addMethod("GET", new LambdaIntegration(getAllowance), {
      operationName: "get allowance"
    });

    this.restAPI = restAPI;
  }
}