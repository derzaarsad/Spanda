import SQS, { MessageList, DeleteMessageBatchRequest, DeleteMessageBatchResult } from "aws-sdk/clients/sqs";

export const deleteMessages = async (sqs: SQS, queueURL: string, messages?: MessageList): Promise<void> => {
  if (messages === undefined) {
    return;
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

  const result: DeleteMessageBatchResult = await sqs.deleteMessageBatch(request).promise();
  if (result.Failed.length > 0) {
    throw "some messages couldn't be deleted.";
  }
};
