import mocha from "mocha";

import cdk = require("@aws-cdk/core");
import { expect as expectCDK, haveResource } from "@aws-cdk/assert";
import { Services } from "../src/services";

describe("The services stack", () => {
  it("Contains an SQS queue", () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Services(app, "MyTestStack");
    // THEN
    expectCDK(stack).to(
      haveResource("AWS::SQS::Queue", {
        VisibilityTimeout: 300
      })
    );
  });

  it("Contains an SNS topic", () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Services(app, "MyTestStack");
    // THEN
    expectCDK(stack).to(haveResource("AWS::SNS::Topic"));
  });
});
