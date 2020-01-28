import * as cdk from "@aws-cdk/core";
import * as ecr from "@aws-cdk/aws-ecr";

export class DatabaseMigrationsRepository extends cdk.Stack {
  readonly repository: ecr.Repository;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    this.repository = new ecr.Repository(this, "DatabaseMigrationsRepository", {
      repositoryName: "dinodime-db-migrations",
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    new cdk.CfnOutput(this, "RepositoryURI", {
      description: "The database migrations container repository URI",
      value: this.repository.repositoryUri
    });
  }
}
