import mocha from "mocha";

import cdk = require("@aws-cdk/core");
import { expect as expectCDK, haveResource } from "@aws-cdk/assert";
import { Services } from "../src/services";
import { Vpc } from "@aws-cdk/aws-ec2";
import { LambdaDeploymentProps } from "../src/lambda-deployment-props";

describe("The services stack", () => {
  let lambdaProps: LambdaDeploymentProps;

  before("setup", () => {
    lambdaProps = {
      vpc: {} as Vpc,
      subnets: [],
      securityGroups: [],
      managedExecutionRolePolicies: []
    };
  });

  it("Contains an SQS queue", () => {
    const app = new cdk.App();

    // WHEN
    const stack = new Services(app, "MyTestStack", lambdaProps);
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
    const stack = new Services(app, "MyTestStack", lambdaProps);
    // THEN
    expectCDK(stack).to(haveResource("AWS::SNS::Topic"));
  });
});
