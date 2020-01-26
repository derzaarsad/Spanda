import { LambdaDeploymentProps } from "./lambda-deployment-props";

export interface NewTransactionsNotificationsProps {
  decryptionKey: string;
  lambdaDeploymentProps: LambdaDeploymentProps;
}
