import SQS, { DeleteMessageRequest } from "aws-sdk/clients/sqs";
import { Status, Failure, Success } from "./status";

export interface SQSClient {
  deleteMessage(receiptHandle: string): Promise<Status>;
}

export class MockSQSClient implements SQSClient {
  deletions: string[];

  constructor() {
    this.deletions = [];
  }

  async deleteMessage(receiptHandle: string): Promise<Status> {
    this.deletions.push(receiptHandle);
    return { kind: "success" };
  }
}

export class AWSSQSClient implements SQSClient {
  private sqs: SQS;
  private queueUrl: string;

  constructor(sqs: SQS, queueUrl: string) {
    this.sqs = sqs;
    this.queueUrl = queueUrl;
  }

  async deleteMessage(receiptHandle: string): Promise<Status> {
    const deletionRequest: DeleteMessageRequest = {
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle
    };

    return this.sqs
      .deleteMessage(deletionRequest)
      .promise()
      .then(() => {
        const status: Success = { kind: "success" };
        return status;
      })
      .catch(err => {
        const status: Failure = { kind: "failure", error: err };
        return status;
      });
  }
}
