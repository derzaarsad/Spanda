import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecr from "@aws-cdk/aws-ecr";
import * as ecs from "@aws-cdk/aws-ecs";
import * as rds from "@aws-cdk/aws-rds";
import * as events from "@aws-cdk/aws-events";
import * as targets from "@aws-cdk/aws-events-targets";
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
  password: string;
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

    const taskDefinition = new ecs.FargateTaskDefinition(this, "UpdateSchemaTaskDefinition");

    taskDefinition.addContainer("dinodime-db-migrations-container", {
      image: image,
      environment: {
        LIQUIBASE_URL: `jdbc:postgresql://${db.instance.instanceEndpoint.hostname}:${db.instance.instanceEndpoint.port}/${db.databaseName}`,
        LIQUIBASE_USERNAME: db.username,
        LIQUIBASE_PASSWORD: db.password
      }
    });

    const runContainer = new tasks.RunEcsFargateTask({
      taskDefinition: taskDefinition,
      cluster: cluster,
      assignPublicIp: vpcConfig.assignPublicIp,
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
