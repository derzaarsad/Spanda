#!/bin/bash -e
# Run this script from the root backend directory
STACK_NAME=DinodimeServices

function getStackOutputsAsJson() {
  local stackName=$1
  aws cloudformation describe-stacks --stack-name $1 --query "Stacks[0].Outputs"
}

function getStackOutput() {
  local stackName=$1
  local stackOutput=$2
  aws cloudformation describe-stacks --stack-name "$1" --query "Stacks[0].Outputs[?OutputKey=='$2'].OutputValue" --output text
}

tableName=$(getStackOutput $STACK_NAME NotificationsTableName)
topicArn=$(getStackOutput $STACK_NAME NotificationsTopicARN)
endpointUrl=$(getStackOutput $STACK_NAME NotificationsEndpointURL)
queueUrl=$(getStackOutput $STACK_NAME NotificationsQueueURL)

env ENDPOINT_URL=$endpointUrl \
  DECRYPTION_KEY=covfefe \
  TABLE_NAME=$tableName \
  QUEUE_URL=$queueUrl \
  yarn workspace dinodime-infrastructure-integtests run test-new-transactions-notification $@