import { LambdaDeploymentProps } from "./lambda-deployment-props";

export interface NewTransactionsNotificationsConfig {
  decryptionKey: string;
  lambdaDeploymentProps: LambdaDeploymentProps;
}
