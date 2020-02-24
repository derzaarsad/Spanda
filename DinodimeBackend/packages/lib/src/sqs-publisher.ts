import SQS from "aws-sdk/clients/sqs";
import { Status, Failure, Success } from "./status";

export interface PublishInput {
  messageBody: any;
}

/**
 * An SQS publisher.
 */
export interface SQSPublisher {
  publish(input: PublishInput): Promise<Status>;
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

  async publish(input: PublishInput): Promise<Status> {
    const sendMessageRequest: SQS.Types.SendMessageRequest = {
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(input.messageBody)
    };

    return this.sqs
      .sendMessage(sendMessageRequest)
      .promise()
      .then(() => {
        const status: Success = {
          kind: "success"
        };
        return status;
      })
      .catch(err => {
        const status: Failure = {
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

  async publish(input: PublishInput): Promise<Status> {
    this.publishedData.push(input);
    return { kind: "success" };
  }
}
