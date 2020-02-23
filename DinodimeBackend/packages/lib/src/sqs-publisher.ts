import SQS from "aws-sdk/clients/sqs";
import { PublishStatus, PublishFailure, PublishSuccess } from "./publish-status";

export interface PublishInput {
  messageBody: any;
}

/**
 * An SQS publisher.
 */
export interface SQSPublisher {
  publish(input: PublishInput): Promise<PublishStatus>;
}

/**
 * The proper SQS publisher backed by AWS.
 */
export class AWSSQSPublisher implements SQSPublisher {
  private sqs: SQS;
  private queueUrl: string;

  constructor(sqs: SQS, queueUrl: string) {
    this.sqs = sqs;
    this.queueUrl = queueUrl;
  }

  async publish(input: PublishInput): Promise<PublishStatus> {
    const sendMessageRequest: SQS.Types.SendMessageRequest = {
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(input.messageBody)
    };

    return this.sqs
      .sendMessage(sendMessageRequest)
      .promise()
      .then(() => {
        const status: PublishSuccess = {
          kind: "success"
        };
        return status;
      })
      .catch(err => {
        const status: PublishFailure = {
          kind: "failure",
          error: err
        };
        return status;
      });
  }
}

export class MockSQSPublisher implements SQSPublisher {
  readonly publishedData: Array<PublishInput>;

  constructor() {
    this.publishedData = [];
  }

  async publish(input: PublishInput): Promise<PublishStatus> {
    this.publishedData.push(input);
    return { kind: "success" };
  }
}
