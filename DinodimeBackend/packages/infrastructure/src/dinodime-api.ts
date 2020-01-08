import cdk = require("@aws-cdk/core");
import lambda = require("@aws-cdk/aws-lambda");
import apigw = require("@aws-cdk/aws-apigateway");
import { Duration } from "@aws-cdk/core";
import { LambdaIntegration } from "@aws-cdk/aws-apigateway";
import { APIConfiguration } from "./api-configuration";

const runtime = lambda.Runtime.NODEJS_12_X;
const duration = Duration.seconds(20);

const configureEnvironment = (apiConfiguration: APIConfiguration): { [key: string]: string } => {
  const environment: { [key: string]: string } = {
    REGION: apiConfiguration.region,
    LOGGER_LEVEL: apiConfiguration.loggerLevel || "debug",
    FINAPI_URL: apiConfiguration.finApiConfiguration.finApiUrl,
    FINAPI_CLIENT_ID: apiConfiguration.finApiConfiguration.finApiClientId,
    FINAPI_CLIENT_SECRET: apiConfiguration.finApiConfiguration.finApiClientSecret,
    FINAPI_TIMEOUT: apiConfiguration.finApiConfiguration.finApiTimeout?.toString() || "3000"
  };

  if (apiConfiguration.backendConfiguration.storageBackend === "POSTGRESQL") {
    throw new Error("not supported yet");
  }

  environment["STORAGE_BACKEND"] = apiConfiguration.backendConfiguration.storageBackend;

  return environment;
};

export class DinodimeAPI extends cdk.Construct {
  readonly restAPI: apigw.RestApi;

  constructor(scope: cdk.Construct, id: string, props: APIConfiguration) {
    super(scope, id);

    const commonEnvironment = configureEnvironment(props);

    const restAPI = new apigw.RestApi(this, "DinodimeAPI");

    // Authenticaction controller
    const users = restAPI.root.addResource("users");

    const isUserAuthenticated = new lambda.Function(this, "IsUserAuthenticated", {
      runtime: runtime,
      timeout: duration,
      code: lambda.Code.asset("../lambda/dist"),
      handler: "api.isUserAuthenticated",
      environment: commonEnvironment
    });

    users.addMethod("GET", new LambdaIntegration(isUserAuthenticated), {
      operationName: "is user authenticated"
    });

    const registerUser = new lambda.Function(this, "RegisterUser", {
      runtime: runtime,
      timeout: duration,
      code: lambda.Code.asset("../lambda/dist"),
      handler: "api.registerUser",
      environment: commonEnvironment
    });

    users.addMethod("POST", new LambdaIntegration(registerUser), {
      operationName: "register user"
    });

    const oauth = restAPI.root.addResource("oauth");
    const login = oauth.addResource("login");

    const authenticateAndSaveUser = new lambda.Function(this, "AuthenticateAndSaveUser", {
      runtime: runtime,
      timeout: duration,
      code: lambda.Code.asset("../lambda/dist"),
      handler: "api.authenticateAndSaveUser",
      environment: commonEnvironment
    });

    login.addMethod("POST", new LambdaIntegration(authenticateAndSaveUser), {
      operationName: "authenticate and save user"
    });

    const token = oauth.addResource("token");

    const updateRefreshToken = new lambda.Function(this, "UpdateRefreshToken", {
      runtime: runtime,
      timeout: duration,
      code: lambda.Code.asset("../lambda/dist"),
      handler: "api.updateRefreshToken",
      environment: commonEnvironment
    });

    token.addMethod("POST", new LambdaIntegration(updateRefreshToken), {
      operationName: "update fefresh token"
    });

    // Authenticaction controller

    const banks = restAPI.root.addResource("banks");
    const blz = banks.addResource("{blz}");

    const getBankByBLZ = new lambda.Function(this, "GetBankByBLZ", {
      runtime: runtime,
      timeout: duration,
      code: lambda.Code.asset("../lambda/dist"),
      handler: "api.getBankByBLZ",
      environment: commonEnvironment
    });

    blz.addMethod("GET", new LambdaIntegration(getBankByBLZ), { operationName: "get bank by BLZ" });

    const bankConnections = restAPI.root.addResource("bankConnections");
    const importBankConnections = bankConnections.addResource("import");

    const getWebFormId = new lambda.Function(this, "GetWebFormId", {
      runtime: runtime,
      timeout: duration,
      code: lambda.Code.asset("../lambda/dist"),
      handler: "api.getWebFormId",
      environment: commonEnvironment
    });

    importBankConnections.addMethod("POST", new LambdaIntegration(getWebFormId), {
      operationName: "get webform id"
    });

    const webForms = restAPI.root.addResource("webForms");
    const callback = webForms.addResource("callback");
    const webFormCallbackResource = callback.addResource("{webFormAuth}");

    const webFormCallback = new lambda.Function(this, "WebFormCallback", {
      runtime: runtime,
      timeout: duration,
      code: lambda.Code.asset("../lambda/dist"),
      handler: "api.webFormCallback",
      environment: commonEnvironment
    });

    webFormCallbackResource.addMethod("POST", new LambdaIntegration(webFormCallback), {
      operationName: "web form callback"
    });

    const webForm = webForms.addResource("{webFormId}");

    const getWebFormInfo = new lambda.Function(this, "GetWebFormInfo", {
      runtime: runtime,
      timeout: duration,
      code: lambda.Code.asset("../lambda/dist"),
      handler: "api.getWebFormInfo",
      environment: commonEnvironment
    });

    webForm.addMethod("GET", new LambdaIntegration(getWebFormInfo), {
      operationName: "get webform info"
    });

    const allowance = restAPI.root.addResource("allowance");

    const getAllowance = new lambda.Function(this, "GetAllowance", {
      runtime: runtime,
      timeout: duration,
      code: lambda.Code.asset("../lambda/dist"),
      handler: "api.getAllowance",
      environment: commonEnvironment
    });

    allowance.addMethod("GET", new LambdaIntegration(getAllowance), {
      operationName: "get allowance"
    });

    this.restAPI = restAPI;
  }
}
