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

if [[ -z "FINAPI_DECRYPTION_KEY" ]]; then
  echo "Please indicate the finapi decryption key in the FINAPI_DECRYPTION_KEY environment variable"
  exit 1
fi

env CALLBACK_ENDPOINT_URL=$callbackEndpointUrl \
  ADMIN_ENDPOINT_URL=$adminUrl \
  FINAPI_DECRYPTION_KEY=$FINAPI_DECRYPTION_KEY \
  yarn workspace dinodime-infrastructure-integtests run test-webform-callback $@