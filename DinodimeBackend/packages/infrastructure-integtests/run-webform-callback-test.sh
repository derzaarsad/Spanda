#!/bin/bash -e
# Run this script from the root backend directory
SCRIPT="$0"
DIRNAME=$(dirname "$0")
STACK_NAME=DinodimeServices

source "$DIRNAME/common_functions.sh"

endpointUrl=$(getStackOutput $STACK_NAME MockFinAPIEndpoint)
queueUrl=$(getStackOutput $STACK_NAME WebFormCompletionsQueueURL)

env ENDPOINT_URL=$endpointUrl \
  QUEUE_URL=$queueUrl \
  yarn workspace dinodime-infrastructure-integtests run test-webform-callback $@