#!/bin/bash -e
# Run this script from the root backend directory
SCRIPT="$0"
DIRNAME=$(dirname "$0")
STACK_NAME=DinodimeServices

source "$DIRNAME/common_functions.sh"

tableName=$(getStackOutput $STACK_NAME NotificationsTableName)
topicArn=$(getStackOutput $STACK_NAME NotificationsTopicARN)
endpointUrl=$(getStackOutput $STACK_NAME NotificationsApiEndpointURL)
queueUrl=$(getStackOutput $STACK_NAME NotificationsQueueURL)

env ENDPOINT_URL=$endpointUrl \
  DECRYPTION_KEY=$FINAPI_DECRYPTION_KEY \
  TABLE_NAME=$tableName \
  QUEUE_URL=$queueUrl \
  yarn workspace dinodime-infrastructure-integtests run test-new-transactions-notification $@