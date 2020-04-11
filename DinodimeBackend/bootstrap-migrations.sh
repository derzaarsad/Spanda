#!/bin/bash -e

if [[ -z "$AWS_REGION" ]]; then
  echo "Please specify the region the resources are deployed in"
  exit 1
fi

if [[ -z "$AWS_ACCOUNT" ]]; then
  echo "Please specify the account the resources are deployed in"
  exit 1
fi

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
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo "Pushing image"
docker push $repository_uri