import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import { LambdaDeploymentProps } from "./lambda-deployment-props";

interface LambdaFactoryProps {
  scope: cdk.Construct;
  deploymentProps: LambdaDeploymentProps;
  runtime: lambda.Runtime;
  duration: cdk.Duration;
  env?: { [key: string]: string };
}

export class LambdaFactory {
  scope: cdk.Construct;
  deploymentProps: LambdaDeploymentProps;
  runtime: lambda.Runtime;
  duration: cdk.Duration;
  env: { [key: string]: string };

  constructor(props: LambdaFactoryProps) {
    this.scope = props.scope;
    this.deploymentProps = props.deploymentProps;
    this.runtime = props.runtime;
    this.duration = props.duration;
    this.env = props.env ? props.env : {};
  }

  public createLambda(id: string, asset: lambda.AssetCode, handler: string): lambda.Function {
    const fn = new lambda.Function(this.scope, id, {
      code: asset,
      handler: handler,
      runtime: this.runtime,
      timeout: this.duration,
      environment: this.env,
      securityGroups: this.deploymentProps.securityGroups,
      vpc: this.deploymentProps.vpc,
      vpcSubnets: this.deploymentProps.subnets
    });

    this.deploymentProps.managedExecutionRolePolicies.forEach(policy => {
      fn.role.addManagedPolicy(policy);
    });

    return fn;
  }
}
