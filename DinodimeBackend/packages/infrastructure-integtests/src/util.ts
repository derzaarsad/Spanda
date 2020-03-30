import SQS, { MessageList, DeleteMessageBatchRequest, DeleteMessageBatchResult } from "aws-sdk/clients/sqs";

export const deleteMessages = async (
  sqs: SQS,
  queueURL: string,
  messages?: MessageList
): Promise<DeleteMessageBatchResult> => {
  if (messages === undefined) {
    return Promise.resolve({ Successful: [], Failed: [] });
  }

  const metadata = messages.map(message => {
    return {
      Id: message.MessageId!,
      ReceiptHandle: message.ReceiptHandle!
    };
  });

  const request: DeleteMessageBatchRequest = {
    Entries: metadata,
    QueueUrl: queueURL
  };

  return sqs.deleteMessageBatch(request).promise();
};
