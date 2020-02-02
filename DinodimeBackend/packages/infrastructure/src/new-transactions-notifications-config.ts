import { LambdaDeploymentProps, LambdaPermissionProps } from "./lambda-factory";

export interface NewTransactionsNotificationsProps {
  decryptionKey: string;
  lambdaDeploymentProps: LambdaDeploymentProps;
  lambdaPermissionProps: LambdaPermissionProps;
}
