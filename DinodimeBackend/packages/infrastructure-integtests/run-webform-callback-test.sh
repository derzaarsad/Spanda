#!/bin/bash -e
# Run this script from the root backend directory
SCRIPT="$0"
DIRNAME=$(dirname "$0")

source "$DIRNAME/common_functions.sh"

apiEndpointUrl=$(getStackOutput DinodimeServices APIEndpointURL)
callbackEndpointUrl=$(getStackOutput DinodimeServices CallbackEndpointURL)
queueUrl=$(getStackOutput DinodimeServices WebFormCompletionsQueueURL)
dlqUrl=$(getStackOutput DinodimeServices WebFormCompletionsDLQURL)
adminUrl=$(getStackOutput DinodimeAdminAPI AdminEndpointURL)

if [[ -z "$apiEndpointUrl" ]]; then
  echo "Please deploy the Dinodime API first"
  exit 1
fi

if [[ -z "$adminUrl" ]]; then
  echo "Please deploy the Dinodime Admin API first"
  exit 1
fi

env API_ENDPOINT_URL=$apiEndpointUrl \
  CALLBACK_ENDPOINT_URL=$callbackEndpointUrl \
  QUEUE_URL=$queueUrl \
  DLQ_URL=$dlqUrl \
  ADMIN_ENDPOINT_URL=$adminUrl \
  yarn workspace dinodime-infrastructure-integtests run test-webform-callback $@