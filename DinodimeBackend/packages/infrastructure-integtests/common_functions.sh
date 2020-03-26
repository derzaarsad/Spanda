function getStackOutputsAsJson() {
  local stackName=$1
  aws cloudformation describe-stacks --stack-name $1 --query "Stacks[0].Outputs"
}

function getStackOutput() {
  local stackName=$1
  local stackOutput=$2
  aws cloudformation describe-stacks --stack-name "$1" --query "Stacks[0].Outputs[?OutputKey=='$2'].OutputValue" --output text
}
