import mocha from "mocha";

import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as iam from "@aws-cdk/aws-iam";
import { expect as expectCDK, haveResource } from "@aws-cdk/assert";
import { Services } from "../src/services";
import { Vpc } from "@aws-cdk/aws-ec2";
import { LambdaDeploymentProps } from "../src/lambda-deployment-props";

describe("The services stack", () => {
  let app: cdk.App;

  beforeEach("setup", () => {
    app = new cdk.App();
  });

  it("Contains an SQS queue", () => {
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
    // WHEN
    const stack = new Services(app, "MyTestStack");
    // THEN
    expectCDK(stack).to(haveResource("AWS::SNS::Topic"));
  });
});
