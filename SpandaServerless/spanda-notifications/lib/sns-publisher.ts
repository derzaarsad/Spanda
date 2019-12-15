import { MessageAttributeMap } from "aws-sdk/clients/sns";

export type PublishInput = {
  message: string;
  topicArn: string;
  messageAttributes: MessageAttributeMap;
};

export type PublishSuccess = {
  kind: "success";
};

export type PublishFailure = {
  kind: "failure";
  error: any;
};

export type PublishStatus = PublishSuccess | PublishFailure;

/**
 * Publishes json-formatted messages on an SNS topic.
 */
export interface SNSPublisher {
  publish(input: PublishInput): Promise<PublishStatus>;
}
