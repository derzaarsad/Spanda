import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecr from "@aws-cdk/aws-ecr";
import * as ecs from "@aws-cdk/aws-ecs";
import * as lambda from "@aws-cdk/aws-lambda";
import * as iam from "@aws-cdk/aws-iam";
import * as logs from "@aws-cdk/aws-logs";
import * as events from "@aws-cdk/aws-events";
import * as targets from "@aws-cdk/aws-events-targets";
import * as sm from "@aws-cdk/aws-secretsmanager";
import * as stepfn from "@aws-cdk/aws-stepfunctions";
import * as tasks from "@aws-cdk/aws-stepfunctions-tasks";
import * as path from "path";
import { RuleTargetInput, EventField } from "@aws-cdk/aws-events";

interface TaskVpcConfiguration {
  assignPublicIp?: boolean;
  vpc?: ec2.IVpc;
  subnets?: ec2.SubnetSelection;
  securityGroup?: ec2.SecurityGroup;
}

interface ImageConfiguration {
  imageRepository: ecr.IRepository;
  imageTag?: string;
}

interface PostgresConfiguration {
  databaseName: string;
  username: string;
  password: sm.Secret;
}

interface DatabaseMigrationsProperties extends cdk.StackProps {
  databaseConfiguration: PostgresConfiguration;
  vpcConfiguration: TaskVpcConfiguration;
  imageConfiguration: ImageConfiguration;
  lambdaManagedPolicies: iam.IManagedPolicy[];
}

export class DatabaseMigrations extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: DatabaseMigrationsProperties) {
    super(scope, id);

    const describeDbInstanceTask = this.createDescribeDbInstancesTask(
      props.vpcConfiguration,
      props.databaseConfiguration,
      props.lambdaManagedPolicies
    );

    const updateSchemaTask = this.createUpdateSchemaTask(
      props.databaseConfiguration,
      props.vpcConfiguration,
      props.imageConfiguration
    );

    const stateMachine = new stepfn.StateMachine(this, "DatabaseMigrationsStateMachine", {
      timeout: cdk.Duration.minutes(3),
      definition: stepfn.Chain.start(describeDbInstanceTask).next(updateSchemaTask)
    });

    const rule = new events.Rule(this, "DatabaseInitializationRule");
    rule.addEventPattern({
      source: ["aws.rds"],
      detailType: ["RDS DB Instance Event"],
      detail: {
        EventCategories: ["creation"]
      }
    });

    rule.addTarget(
      new targets.SfnStateMachine(stateMachine, {
        input: RuleTargetInput.fromObject({
          dbInstanceId: EventField.fromPath("$.detail.SourceIdentifier")
        })
      })
    );
  }

  private createDescribeDbInstancesTask(
    vpcConfig: TaskVpcConfiguration,
    databaseConfiguration: PostgresConfiguration,
    lambdaManagedPolicies: iam.IManagedPolicy[]
  ): stepfn.Task {
    const role = new iam.Role(this, "DescribeDbInstancesRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com")
    });

    const fn = new lambda.Function(this, "DescribeDatabaseInstanceFunctionLambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      timeout: cdk.Duration.seconds(20),
      code: lambda.Code.asset(path.join("..", "lambda", "dist", "lambda-describe-db-instance")),
      handler: "main.handler",
      vpc: vpcConfig.vpc,
      securityGroup: vpcConfig.securityGroup,
      vpcSubnets: vpcConfig.subnets,
      role: role,
      environment: {
        DATABASE_NAME: databaseConfiguration.databaseName
      }
    });

    lambdaManagedPolicies.forEach(policy => role.addManagedPolicy(policy));

    const describePolicyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["rds:Describe*"]
    });
    describePolicyStatement.addAllResources();

    role.addToPolicy(describePolicyStatement);

    const taskDefinition = new tasks.RunLambdaTask(fn);

    const task = new stepfn.Task(this, "DescribeDbInstance", {
      task: taskDefinition,
      timeout: cdk.Duration.minutes(1),
      outputPath: "$.Payload"
    });
    task.addRetry({ backoffRate: 2, maxAttempts: 3, interval: cdk.Duration.seconds(2) });

    return task;
  }

  private createUpdateSchemaTask(
    databaseConfiguration: PostgresConfiguration,
    vpcConfiguration: TaskVpcConfiguration,
    imageConfiguration: ImageConfiguration
  ): stepfn.Task {
    const cluster = new ecs.Cluster(this, "DatabaseMigrationsCluster", {
      clusterName: "dinodime-database-migrations-cluster",
      vpc: vpcConfiguration.vpc
    });

    const image = ecs.ContainerImage.fromEcrRepository(
      imageConfiguration.imageRepository,
      imageConfiguration.imageTag
    );

    const logGroup = new logs.LogGroup(this, "DbMigrationsLogGroup", {
      logGroupName: "dinodime-db-migrations",
      retention: logs.RetentionDays.FIVE_DAYS,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const allowPublishLogs = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
      resources: [logGroup.logGroupArn]
    });

    const updateSchemaTaskDefinition = new ecs.FargateTaskDefinition(
      this,
      "UpdateSchemaTaskDefinition"
    );
    updateSchemaTaskDefinition.addToExecutionRolePolicy(allowPublishLogs);

    const databasePassword = sm.Secret.fromSecretArn(
      this,
      "DatabasePassword",
      databaseConfiguration.password.secretArn
    );

    updateSchemaTaskDefinition.addToTaskRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["secretsmanager:GetSecretValue"],
        resources: [databasePassword.secretArn]
      })
    );

    if (databasePassword.encryptionKey) {
      updateSchemaTaskDefinition.addToTaskRolePolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["kms:Decrypt"],
          resources: [databasePassword.encryptionKey.keyArn]
        })
      );
    }

    updateSchemaTaskDefinition.addContainer("dinodime-db-migrations-container", {
      image: image,
      environment: {
        LIQUIBASE_USERNAME: databaseConfiguration.username
      },
      secrets: { LIQUIBASE_PASSWORD: ecs.Secret.fromSecretsManager(databasePassword) },
      logging: ecs.LogDriver.awsLogs({ logGroup: logGroup, streamPrefix: "update" }),
      command: ["update"]
    });

    const updateSchemaTask = new tasks.RunEcsFargateTask({
      taskDefinition: updateSchemaTaskDefinition,
      cluster: cluster,
      assignPublicIp: vpcConfiguration.assignPublicIp || false,
      subnets: vpcConfiguration.subnets,
      securityGroup: vpcConfiguration.securityGroup,
      containerOverrides: [
        {
          containerName: "dinodime-db-migrations-container",
          environment: [
            {
              name: "LIQUIBASE_URL",
              value: stepfn.Data.stringAt("$.postgresJdbcUrl")
            }
          ]
        }
      ]
    });

    return new stepfn.Task(this, "UpdateSchema", {
      task: updateSchemaTask,
      timeout: cdk.Duration.minutes(1)
    });
  }
}
