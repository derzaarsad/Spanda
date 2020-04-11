function getStackOutputsAsJson() {
  local stackName=$1
  aws cloudformation describe-stacks --stack-name $1 --query "Stacks[0].Outputs"
}

function getStackOutput() {
  local stackName=$1
  local stackOutput=$2
  aws cloudformation describe-stacks --stack-name "$1" --query "Stacks[0].Outputs[?OutputKey=='$2'].OutputValue" --output text
}

if [[ -z "$AWS_REGION" ]]; then
  echo "Please indicate the deployment region in the AWS_REGION variable"
  exit 1
fi

if [[ -z "$FINAPI_DECRYPTION_KEY" ]]; then
  echo "Please indicate the finapi decryption key in the FINAPI_DECRYPTION_KEY environment variable"
  exit 1
fi
