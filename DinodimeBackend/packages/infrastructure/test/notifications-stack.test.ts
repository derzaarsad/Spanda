import chai from "chai";
const expect = chai.expect;

import cdk = require("@aws-cdk/core");
import { expect as expectCDK, haveResource } from "@aws-cdk/assert";
import { DinodimeStack } from "../src/dinodime-stack";

describe("The notifications stack", () => {
  it("Contains an SQS queue", () => {
    const app = new cdk.App();
    // WHEN
    const stack = new DinodimeStack(app, "MyTestStack");
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
    const stack = new DinodimeStack(app, "MyTestStack");
    // THEN
    expectCDK(stack).to(haveResource("AWS::SNS::Topic"));
  });
});
