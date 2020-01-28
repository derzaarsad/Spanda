import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecr from "@aws-cdk/aws-ecr";
import * as ecs from "@aws-cdk/aws-ecs";
import * as rds from "@aws-cdk/aws-rds";
import * as iam from "@aws-cdk/aws-iam";
import * as logs from "@aws-cdk/aws-logs";
import * as events from "@aws-cdk/aws-events";
import * as targets from "@aws-cdk/aws-events-targets";
import * as sm from "@aws-cdk/aws-secretsmanager";
import * as stepfn from "@aws-cdk/aws-stepfunctions";
import * as tasks from "@aws-cdk/aws-stepfunctions-tasks";

interface TaskVpcConfiguration {
  assignPublicIp?: boolean;
  vpc?: ec2.IVpc;
  subnets?: ec2.SubnetSelection;
  securityGroup?: ec2.SecurityGroup;
}

interface PostgresConfiguration {
  instance: rds.DatabaseInstance;
  databaseName: string;
  username: string;
  password: sm.Secret;
}

interface DatabaseMigrationsProperties extends cdk.StackProps {
  databaseConfiguration: PostgresConfiguration;
  imageRepository: ecr.IRepository;
  imageTag?: string;
  vpcConfiguration: TaskVpcConfiguration;
}

export class DatabaseMigrations extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: DatabaseMigrationsProperties) {
    super(scope, id);

    const vpcConfig = props.vpcConfiguration;

    const cluster = new ecs.Cluster(this, "DatabaseMigrationsCluster", {
      clusterName: "dinodime-database-migrations-cluster",
      vpc: vpcConfig.vpc
    });

    const db = props.databaseConfiguration;

    const image = ecs.ContainerImage.fromEcrRepository(props.imageRepository, props.imageTag);

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

    const taskDefinition = new ecs.FargateTaskDefinition(this, "UpdateSchemaTaskDefinition");
    taskDefinition.addToExecutionRolePolicy(allowPublishLogs);

    const databasePassword = sm.Secret.fromSecretArn(
      this,
      "DatabasePassword",
      db.password.secretArn
    );
    taskDefinition.addToTaskRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["secretsmanager:GetSecretValue"],
        resources: [databasePassword.secretArn]
      })
    );

    if (databasePassword.encryptionKey) {
      taskDefinition.addToTaskRolePolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["kms:Decrypt"],
          resources: [databasePassword.encryptionKey.keyArn]
        })
      );
    }

    taskDefinition.addContainer("dinodime-db-migrations-container", {
      image: image,
      environment: {
        LIQUIBASE_URL: `jdbc:postgresql://${db.instance.instanceEndpoint.hostname}:${db.instance.dbInstanceEndpointPort}/${db.databaseName}`,
        LIQUIBASE_USERNAME: db.username
      },
      secrets: { LIQUIBASE_PASSWORD: ecs.Secret.fromSecretsManager(databasePassword) },
      logging: ecs.LogDriver.awsLogs({ logGroup: logGroup, streamPrefix: "update" }),
      command: ["update"]
    });

    const runContainer = new tasks.RunEcsFargateTask({
      taskDefinition: taskDefinition,
      cluster: cluster,
      assignPublicIp: vpcConfig.assignPublicIp || false,
      subnets: vpcConfig.subnets,
      securityGroup: vpcConfig.securityGroup
    });

    const runContainerTask = new stepfn.Task(this, "RunContainerTask", {
      task: runContainer,
      timeout: cdk.Duration.minutes(1)
    });

    const stateMachine = new stepfn.StateMachine(this, "DatabaseMigrationsStateMachine", {
      timeout: cdk.Duration.minutes(3),
      definition: stepfn.Chain.start(runContainerTask)
    });

    const rule = new events.Rule(this, "DatabaseInitializationRule");
    rule.addEventPattern({
      resources: [db.instance.instanceArn],
      source: ["aws.rds"],
      detailType: ["RDS DB Instance Event"],
      detail: {
        EventCategories: ["availability"]
      }
    });

    rule.addTarget(new targets.SfnStateMachine(stateMachine));
  }
}
