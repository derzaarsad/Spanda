import { aws_iam, aws_lambda, aws_ec2, Duration } from "aws-cdk-lib"
import { Construct } from 'constructs';

/**
 * Configuration interface for services stacks deploying lambda functions.
 */
export class LambdaPermissionProps {
  managedPolicies: aws_iam.IManagedPolicy[];
  policyStatements: aws_iam.PolicyStatement[];

  constructor(managedPolicies?: aws_iam.IManagedPolicy[], policyStatements?: aws_iam.PolicyStatement[]) {
    this.managedPolicies = managedPolicies || [];
    this.policyStatements = policyStatements || [];
  }

  addManagedPolicy(managedPolicy: aws_iam.IManagedPolicy): LambdaPermissionProps {
    const policies = this.managedPolicies.slice();
    const statements = this.policyStatements.slice();

    policies.push(managedPolicy);
    return new LambdaPermissionProps(policies, statements);
  }

  addPolicyStatement(policyStatement: aws_iam.PolicyStatement) {
    const policies = this.managedPolicies.slice();
    const statements = this.policyStatements.slice();

    statements.push(policyStatement);
    return new LambdaPermissionProps(policies, statements);
  }

  applyToRole(role: aws_iam.Role) {
    this.managedPolicies.forEach((managedPolicy) => {
      role.addManagedPolicy(managedPolicy);
    });

    this.policyStatements.forEach((policyStatement) => {
      role.addToPolicy(policyStatement);
    });
  }
}

/**
 * Configuration interface for services stacks deploying lambda functions.
 */
export interface LambdaDeploymentProps {
  vpc?: aws_ec2.Vpc;
  subnets?: aws_ec2.SubnetSelection;
  securityGroups?: aws_ec2.SecurityGroup[];
}

interface LambdaFactoryProps {
  scope: Construct;
  deploymentProps?: LambdaDeploymentProps;
  permissionProps?: LambdaPermissionProps;
  runtime: aws_lambda.Runtime;
  duration: Duration;
  executionRole: aws_iam.Role;
  withTracing?: boolean;
  env?: { [key: string]: string };
}

/**
 * A utility object for creating functions with a common purpose.
 */
export class LambdaFactory {
  scope: Construct;
  deploymentProps?: LambdaDeploymentProps;
  permissionProps?: LambdaPermissionProps;
  runtime: aws_lambda.Runtime;
  duration: Duration;
  env: { [key: string]: string };
  executionRole: aws_iam.Role;
  withTracing: boolean;

  constructor(props: LambdaFactoryProps) {
    this.scope = props.scope;
    this.deploymentProps = props.deploymentProps;
    this.permissionProps = props.permissionProps;
    this.runtime = props.runtime;
    this.duration = props.duration;
    this.env = props.env ? props.env : {};
    this.executionRole = props.executionRole;
    this.withTracing = props.withTracing ? props.withTracing : false;

    if (this.permissionProps) {
      this.permissionProps.applyToRole(this.executionRole);
    }
  }

  public createLambda(id: string, asset: aws_lambda.AssetCode, handler: string): aws_lambda.Function {
    const fn = new aws_lambda.Function(this.scope, id, {
      code: asset,
      handler: handler,
      runtime: this.runtime,
      timeout: this.duration,
      environment: this.env,
      securityGroups: this.deploymentProps ? this.deploymentProps.securityGroups : undefined,
      vpc: this.deploymentProps ? this.deploymentProps.vpc : undefined,
      vpcSubnets: this.deploymentProps ? this.deploymentProps.subnets : undefined,
      role: this.executionRole,
      tracing: this.withTracing ? aws_lambda.Tracing.ACTIVE : aws_lambda.Tracing.DISABLED,
    });

    return fn;
  }
}
