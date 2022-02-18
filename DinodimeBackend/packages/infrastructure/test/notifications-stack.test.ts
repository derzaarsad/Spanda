import mocha from "mocha";

import { App } from "aws-cdk-lib";
import { Capture, Match, Template } from "aws-cdk-lib/assertions";
import { Services } from "../src/services";
import { ServicesProps } from "../src/services-props";
import { LambdaPermissionProps } from "../src/lambda-factory";
import { expect } from "chai";

describe("The services stack", () => {
  let app: App;
  let props: ServicesProps;

  beforeEach("setup", () => {
    app = new App();
    props = {
      env: {},
      finApiProps: {
        finApiClientId: "client-id",
        finApiClientSecret: "client-secret",
        finApiDecryptionKey: "covfefe",
        finApiUrl: "https://sandbox.finapi.com",
        finApiTimeout: 3000
      },
      backendConfiguration: {
        storageBackend: "IN_MEMORY"
      },
      lambdaDeploymentProps: {},
      lambdaPermissionProps: new LambdaPermissionProps(),
      firebaseProps: {
        firebaseServerKey: ""
      }
    };
  });

  it("Contains an SQS queue", () => {
    // WHEN
    const stack = new Services(app, "MyTestStack", props);
    // THEN
    const template = Template.fromStack(stack);
    template.hasResource("AWS::SQS::Queue", {
      VisibilityTimeout: 300
    });
  });

  it("Contains an SNS topic", () => {
    // WHEN
    const stack = new Services(app, "MyTestStack", props);
    // THEN
    const template = Template.fromStack(stack);
    template.hasResource("AWS::SNS::Topic",{});
  });
});
