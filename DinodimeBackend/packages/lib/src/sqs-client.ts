import SQS, { DeleteMessageRequest } from "aws-sdk/clients/sqs";

export type DeletionSuccess = {
  kind: "success";
};

export type DeletionFailure = {
  kind: "failure";
  error: any;
};

export type DeletionStatus = DeletionSuccess | DeletionFailure;

export interface SQSClient {
  deleteMessage(receiptHandle: string): Promise<DeletionStatus>;
}

export class MockSQSClient implements SQSClient {
  deletions: string[];

  constructor() {
    this.deletions = [];
  }

  async deleteMessage(receiptHandle: string): Promise<DeletionStatus> {
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

  async deleteMessage(receiptHandle: string): Promise<DeletionStatus> {
    const deletionRequest: DeleteMessageRequest = {
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle
    };

    return this.sqs
      .deleteMessage(deletionRequest)
      .promise()
      .then(() => {
        const status: DeletionSuccess = { kind: "success" };
        return status;
      })
      .catch(err => {
        const status: DeletionFailure = { kind: "failure", error: err };
        return status;
      });
  }
}
