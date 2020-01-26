#!/bin/bash -e

STACK_NAME=DinodimeDbMigrationsRepository

echo "Deploying repository"
yarn workspace dinodime-infrastructure run cdk deploy "${STACK_NAME}" \
  -c awsRegion=${AWS_REGION} \
  -c awsAccount=${AWS_ACCOUNT}

repository_uri=$(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" \
  --query "Stacks[0].Outputs[?OutputKey=='RepositoryURI'].OutputValue" \
  --output text)

echo "Building image"
(cd migrations/postgres && docker build -t "${repository_uri}" .)

echo "Logging into the repository"
`aws ecr get-login --registry-ids ${AWS_ACCOUNT} --no-include-email`

echo "Pushing image"
docker push $repository_uri