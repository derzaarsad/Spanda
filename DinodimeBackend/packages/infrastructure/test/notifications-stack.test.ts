import mocha from "mocha";

import * as cdk from "@aws-cdk/core";
import { expect as expectCDK, haveResource } from "@aws-cdk/assert";
import { Services } from "../src/services";
import { ServicesProps } from "../src/services-props";

describe("The services stack", () => {
  let app: cdk.App;
  let props: ServicesProps;

  beforeEach("setup", () => {
    app = new cdk.App();
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
      }
    };
  });

  it("Contains an SQS queue", () => {
    // WHEN
    const stack = new Services(app, "MyTestStack", props);
    // THEN
    expectCDK(stack).to(
      haveResource("AWS::SQS::Queue", {
        VisibilityTimeout: 300
      })
    );
  });

  it("Contains an SNS topic", () => {
    // WHEN
    const stack = new Services(app, "MyTestStack", props);
    // THEN
    expectCDK(stack).to(haveResource("AWS::SNS::Topic"));
  });
});
