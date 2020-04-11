import SQS, { DeleteMessageRequest } from "aws-sdk/clients/sqs";
import { Status, Failure, Success } from "./status";

export interface SQSClient {
  deleteMessage(receiptHandle: string): Promise<Status<String>>;
}

export class MockSQSClient implements SQSClient {
  deletions: string[];

  constructor() {
    this.deletions = [];
  }

  async deleteMessage(receiptHandle: string): Promise<Status<String>> {
    this.deletions.push(receiptHandle);
    return { kind: "success", result: receiptHandle };
  }
}

export class AWSSQSClient implements SQSClient {
  private sqs: SQS;
  private queueUrl: string;

  constructor(sqs: SQS, queueUrl: string) {
    this.sqs = sqs;
    this.queueUrl = queueUrl;
  }

  async deleteMessage(receiptHandle: string): Promise<Status<String>> {
    const deletionRequest: DeleteMessageRequest = {
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle,
    };

    return this.sqs
      .deleteMessage(deletionRequest)
      .promise()
      .then((result) => {
        const status: Success<String> = { kind: "success", result: receiptHandle };
        return status;
      })
      .catch((err) => {
        const status: Failure = { kind: "failure", error: err };
        return status;
      });
  }
}
