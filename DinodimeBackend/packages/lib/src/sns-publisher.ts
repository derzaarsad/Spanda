import SNS from "aws-sdk/clients/sns";
import { MessageAttributeMap } from "aws-sdk/clients/sns";
import { PublishStatus, PublishFailure, PublishSuccess } from "./publish-status";

/**
 * A type summarizing the required input parameters for publishing to SQS.
 */
export class PublishInput {
  readonly message: any;
  readonly topicArn: string;
  readonly messageAttributes: MessageAttributeMap;

  constructor(topicArn: string, message: any, messageAttributes: MessageAttributeMap) {
    this.topicArn = topicArn;
    this.message = message;
    this.messageAttributes = messageAttributes;
  }

  messageEnvelope(): string {
    const messageBody = JSON.stringify(this.message);
    const messageEnvelope = JSON.stringify({
      default: messageBody
    });
    return messageEnvelope;
  }
}

/**
 * Publishes json-formatted messages on an SNS topic.
 */
export interface SNSPublisher {
  publish(input: PublishInput): Promise<PublishStatus>;
}

/**
 * The proper SNS publisher.
 */
export class AWSSNSPublisher implements SNSPublisher {
  private sns: SNS;

  constructor(sns: SNS) {
    this.sns = sns;
  }

  async publish(input: PublishInput): Promise<PublishStatus> {
    const params: SNS.PublishInput = {
      TopicArn: input.topicArn,
      MessageStructure: "json",
      Message: input.messageEnvelope(),
      MessageAttributes: input.messageAttributes
    };

    return this.sns
      .publish(params)
      .promise()
      .then(() => {
        const status: PublishSuccess = {
          kind: "success"
        };
        return status;
      })
      .catch((err: any) => {
        const status: PublishFailure = {
          kind: "failure",
          error: err
        };
        return status;
      });
  }
}

export class MockSNSPublisher implements SNSPublisher {
  readonly publishedData: Array<PublishInput>;

  constructor() {
    this.publishedData = [];
  }

  async publish(input: PublishInput): Promise<PublishStatus> {
    this.publishedData.push(input);
    return { kind: "success" };
  }
}
