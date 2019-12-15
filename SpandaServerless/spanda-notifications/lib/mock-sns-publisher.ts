import { SNSPublisher, PublishInput, PublishStatus } from "./sns-publisher";

export default class MockSNSPublisher implements SNSPublisher {
  publishedData: Array<PublishInput>;

  constructor() {
    this.publishedData = [];
  }

  async publish(input: PublishInput): Promise<PublishStatus> {
    this.publishedData.push(input);
    return { kind: "success" };
  }
}
