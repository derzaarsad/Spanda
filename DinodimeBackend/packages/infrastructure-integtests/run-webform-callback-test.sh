#!/bin/bash -e
# Run this script from the root backend directory
SCRIPT="$0"
DIRNAME=$(dirname "$0")

source "$DIRNAME/common_functions.sh"

endpointUrl=$(getStackOutput MockFinAPI MockFinAPIEndpoint)
queueUrl=$(getStackOutput DinodimeServices WebFormCompletionsQueueURL)

env ENDPOINT_URL=$endpointUrl \
  QUEUE_URL=$queueUrl \
  yarn workspace dinodime-infrastructure-integtests run test-webform-callback $@