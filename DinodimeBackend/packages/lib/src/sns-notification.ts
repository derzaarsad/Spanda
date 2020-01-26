import { MessageAttributeMap } from "aws-sdk/clients/sns";

/**
 * A type representing the message payload contents received by SNS.
 */
export type SNSNotification = {
  Type: "Notification";
  MessageId: string;
  TopicArn: string;
  Message?: string;
  Signature: string;
  SigningCertURL: string;
  UnsubscribeURL: string;
  MessageAttributes?: MessageAttributeMap;
};
