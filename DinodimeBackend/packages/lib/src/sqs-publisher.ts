import SQS from "aws-sdk/clients/sqs";
import { Status, Failure, Success } from "./status";

export interface PublishInput {
  messageBody: any;
}

/**
 * An SQS publisher.
 */
export interface SQSPublisher {
  publish(input: PublishInput): Promise<Status<String>>;
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

  async publish(input: PublishInput): Promise<Status<String>> {
    const sendMessageRequest: SQS.Types.SendMessageRequest = {
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(input.messageBody),
    };

    return this.sqs
      .sendMessage(sendMessageRequest)
      .promise()
      .then((result) => {
        const status: Success<String> = {
          kind: "success",
          result: result.MessageId ? result.MessageId : "",
        };
        return status;
      })
      .catch((err) => {
        const status: Failure = {
          kind: "failure",
          error: err,
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

  async publish(input: PublishInput): Promise<Status<String>> {
    this.publishedData.push(input);
    return { kind: "success", result: this.publishedData.length.toString() };
  }
}
