import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as lambda from "@aws-cdk/aws-lambda";

/**
 * Configuration interface for services stacks deploying lambda functions.
 */
export class LambdaPermissionProps {
  managedPolicies: iam.IManagedPolicy[];
  policyStatements: iam.PolicyStatement[];

  constructor(managedPolicies?: iam.IManagedPolicy[], policyStatements?: iam.PolicyStatement[]) {
    this.managedPolicies = managedPolicies || [];
    this.policyStatements = policyStatements || [];
  }

  addManagedPolicy(managedPolicy: iam.IManagedPolicy): LambdaPermissionProps {
    const policies = this.managedPolicies.slice();
    const statements = this.policyStatements.slice();

    policies.push(managedPolicy);
    return new LambdaPermissionProps(policies, statements);
  }

  addPolicyStatement(policyStatement: iam.PolicyStatement) {
    const policies = this.managedPolicies.slice();
    const statements = this.policyStatements.slice();

    statements.push(policyStatement);
    return new LambdaPermissionProps(policies, statements);
  }

  applyToRole(role: iam.Role) {
    this.managedPolicies.forEach(managedPolicy => {
      role.addManagedPolicy(managedPolicy);
    });

    this.policyStatements.forEach(policyStatement => {
      role.addToPolicy(policyStatement);
    });
  }
}

/**
 * Configuration interface for services stacks deploying lambda functions.
 */
export interface LambdaDeploymentProps {
  vpc?: ec2.Vpc;
  subnets?: ec2.SubnetSelection;
  securityGroups?: ec2.SecurityGroup[];
}

interface LambdaFactoryProps {
  scope: cdk.Construct;
  deploymentProps?: LambdaDeploymentProps;
  permissionProps?: LambdaPermissionProps;
  runtime: lambda.Runtime;
  duration: cdk.Duration;
  executionRole: iam.Role;
  env?: { [key: string]: string };
}

/**
 * A utility object for creating functions with a common purpose.
 */
export class LambdaFactory {
  scope: cdk.Construct;
  deploymentProps?: LambdaDeploymentProps;
  permissionProps?: LambdaPermissionProps;
  runtime: lambda.Runtime;
  duration: cdk.Duration;
  env: { [key: string]: string };
  executionRole: iam.Role;

  constructor(props: LambdaFactoryProps) {
    this.scope = props.scope;
    this.deploymentProps = props.deploymentProps;
    this.permissionProps = props.permissionProps;
    this.runtime = props.runtime;
    this.duration = props.duration;
    this.env = props.env ? props.env : {};
    this.executionRole = props.executionRole;

    if (this.permissionProps) {
      this.permissionProps.applyToRole(this.executionRole);
    }
  }

  public createLambda(id: string, asset: lambda.AssetCode, handler: string): lambda.Function {
    const fn = new lambda.Function(this.scope, id, {
      code: asset,
      handler: handler,
      runtime: this.runtime,
      timeout: this.duration,
      environment: this.env,
      securityGroups: this.deploymentProps ? this.deploymentProps.securityGroups : undefined,
      vpc: this.deploymentProps ? this.deploymentProps.vpc : undefined,
      vpcSubnets: this.deploymentProps ? this.deploymentProps.subnets : undefined,
      role: this.executionRole
    });

    return fn;
  }
}
