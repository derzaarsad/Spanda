import {
  SNSPublisher,
  PublishInput,
  PublishStatus,
  PublishSuccess,
  PublishFailure
} from "./sns-publisher";
import SNS from "aws-sdk/clients/sns";

/**
 * The proper SNS publisher.
 */
export default class AWSSNSPublisher implements SNSPublisher {
  private sns: SNS;

  constructor(sns: SNS) {
    this.sns = sns;
  }

  async publish(input: PublishInput): Promise<PublishStatus> {
    const params: SNS.PublishInput = {
      TopicArn: input.topicArn,
      MessageStructure: "json",
      Message: input.message,
      MessageAttributes: input.messageAttributes
    };

    return this.sns
      .publish(params)
      .promise()
      .then((_: SNS.PublishResponse) => {
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
