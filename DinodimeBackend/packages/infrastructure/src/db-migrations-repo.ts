import { aws_ecr, Stack, StackProps, RemovalPolicy, CfnOutput } from "aws-cdk-lib";
import { Construct } from 'constructs';

export class DatabaseMigrationsRepository extends Stack {
  readonly repository: aws_ecr.Repository;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id);

    this.repository = new aws_ecr.Repository(this, "DatabaseMigrationsRepository", {
      repositoryName: "dinodime-db-migrations",
      removalPolicy: RemovalPolicy.DESTROY
    });

    new CfnOutput(this, "RepositoryURI", {
      description: "The database migrations container repository URI",
      value: this.repository.repositoryUri
    });
  }
}
