import mocha from "mocha";

import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import { expect as expectCDK, haveResource } from "@aws-cdk/assert";
import { Services } from "../src/services";
import { Vpc } from "@aws-cdk/aws-ec2";
import { LambdaDeploymentProps } from "../src/lambda-deployment-props";

describe("The services stack", () => {
  let lambdaProps: LambdaDeploymentProps;

  before("setup", () => {
    lambdaProps = {
      vpc: {} as Vpc,
      subnets: { subnetType: ec2.SubnetType.PRIVATE },
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
