import SQS from "aws-sdk/clients/sqs";
import { PublishStatus, PublishFailure, PublishSuccess } from "./publish-status";

export interface PublishInput {
  queueUrl: string;
  messageBody: any;
}

export interface SQSPublisher {
  publish(input: PublishInput): Promise<PublishStatus>;
}

/**
 * The
 */
export class AWSSQSPublisher implements SQSPublisher {
  private sqs: SQS;

  constructor(sqs: SQS) {
    this.sqs = sqs;
  }

  async publish(input: PublishInput): Promise<PublishStatus> {
    const sendMessageRequest: SQS.Types.SendMessageRequest = {
      QueueUrl: input.queueUrl,
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
