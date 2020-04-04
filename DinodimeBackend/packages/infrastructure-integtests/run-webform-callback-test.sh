#!/bin/bash -e
# Run this script from the root backend directory
SCRIPT="$0"
DIRNAME=$(dirname "$0")

source "$DIRNAME/common_functions.sh"

# adminapi

endpointUrl=$(getStackOutput DinodimeServices CallbackEndpointURL)
queueUrl=$(getStackOutput DinodimeServices WebFormCompletionsQueueURL)
dlqUrl=$(getStackOutput DinodimeServices WebFormCompletionsDLQURL)
adminUrl=$(getStackOutput DinodimeAdminAPI AdminEndpointURL)

env ENDPOINT_URL=$endpointUrl \
  QUEUE_URL=$queueUrl \
  DLQ_URL=$dlqUrl \
  ADMIN_URL=$adminUrl \
  yarn workspace dinodime-infrastructure-integtests run test-webform-callback $@