#!/bin/bash -e
# Run this script from the root backend directory
SCRIPT="$0"
DIRNAME=$(dirname "$0")

source "$DIRNAME/common_functions.sh"

callbackEndpointUrl=$(getStackOutput DinodimeServices CallbackEndpointURL)
adminUrl=$(getStackOutput DinodimeAdminAPI AdminEndpointURL)

if [[ -z "$callbackEndpointUrl" ]]; then
  echo "Please deploy the Dinodime API first"
  exit 1
fi

if [[ -z "$adminUrl" ]]; then
  echo "Please deploy the Dinodime Admin API first"
  exit 1
fi

env CALLBACK_ENDPOINT_URL=$callbackEndpointUrl \
  ADMIN_ENDPOINT_URL=$adminUrl \
  yarn workspace dinodime-infrastructure-integtests run test-webform-callback $@