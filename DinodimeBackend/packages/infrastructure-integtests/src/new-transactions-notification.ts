import chai from "chai";
const assert = chai.assert;
const expect = chai.expect;

import axios, { AxiosInstance } from "axios";

import AWS from "aws-sdk";
import DynamoDB from "aws-sdk/clients/dynamodb";
import SQS, {
  MessageList,
  DeleteMessageBatchRequest,
  DeleteMessageBatchResult
} from "aws-sdk/clients/sqs";
import { AesCrypto, DecryptedNewTransactionsNotification } from "dinodime-lib";

import { v4 as uuid } from "uuid";
import { SNSNotification } from "dinodime-lib";
import { DynamoDBRuleHandleRepository } from "dinodime-lib";
import { NewTransactionsEncryptor } from "dinodime-lib";
import { UUIDRuleHandleFactory } from "dinodime-lib";
import { RuleHandle } from "dinodime-lib";

AWS.config.update({ region: process.env.CDK_DEPLOY_REGION });

const env = process.env;
const endpointURL = env["ENDPOINT_URL"] as string;
const decryptionKey = env["DECRYPTION_KEY"] as string;
const tableName = env["TABLE_NAME"] as string;
const queueURL = env["QUEUE_URL"] as string;

const sqs = new SQS();

const crypto = new AesCrypto(decryptionKey);
const factory = new UUIDRuleHandleFactory(uuid);
const ruleHandlesRepository = new DynamoDBRuleHandleRepository(new DynamoDB(), tableName);
const encryptor = new NewTransactionsEncryptor(crypto);

const ruleType = "NEW_TRANSACTIONS";
const ruleHandle = factory.create(1, "test-user", ruleType);

const cleartextNotification: DecryptedNewTransactionsNotification = {
  notificationRuleId: 1,
  triggerEvent: ruleType,
  callbackHandle: ruleHandle.id,
  newTransactions: [
    {
      accountId: 1,
      accountName: "accountName1",
      accountNumber: "accountNumber1",
      accountIban: "accountIban1",
      bankName: "bankName1",
      bankConnectionName: "bankConnectionName1",
      newTransactionsCount: 1,
      details: {
        transactionDetails: [
          {
            id: 1,
            finapiBookingDate: "2019-11-18",
            bankBookingDate: "2019-11-18",
            amount: 200,
            counterpartName: "your uncle",
            purpose: "cash",
            isAdjustingEntry: false
          }
        ]
      }
    }
  ]
};

const http: AxiosInstance = axios.create({ baseURL: endpointURL });
const encryptedNotification = encryptor.map(cleartextNotification);

const unpackTransactions = (message: SQS.Message): DecryptedNewTransactionsNotification | null => {
  if (message.Body === undefined) {
    return null;
  }

  const notification = JSON.parse(message.Body) as SNSNotification;
  if (notification.Message) {
    return JSON.parse(notification.Message) as DecryptedNewTransactionsNotification;
  } else {
    return null;
  }
};

const deleteMessages = async (messages?: MessageList): Promise<void> => {
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

describe("New transactions notifications stack", async function() {
  it("sends and receives a new transactions notification", async function() {
    this.timeout(20000);

    let persistedHandle: RuleHandle | undefined;
    let messages: MessageList | undefined;

    console.log("saving rule handle");
    await ruleHandlesRepository
      .save(ruleHandle)
      .then(result => {
        persistedHandle = result;
        console.log("posting notification");
        return http.post("/", encryptedNotification);
      })
      .then(() => {
        const params = { QueueUrl: queueURL, AttributeNames: ["All"], WaitTimeSeconds: 3 };
        return sqs.receiveMessage(params).promise();
      })
      .then(result => {
        messages = result.Messages;
      })
      .finally(() => {
        console.log("deleting received messages");
        deleteMessages(messages);

        if (persistedHandle) {
          console.log("deleting rule handle");
          ruleHandlesRepository.delete(ruleHandle);
        }
      });

    if (messages !== undefined) {
      const message = messages.find(message => {
        const transactions = unpackTransactions(message);
        if (transactions) {
          return transactions.callbackHandle === ruleHandle.id;
        } else {
          return false;
        }
      });

      if (!message) {
        assert.fail("No message corresponding to the rule type has been found");
      }

      const transactions = unpackTransactions(message!);
      expect(transactions!.notificationRuleId).to.eq(1);
      expect(transactions!.triggerEvent).to.eq(ruleType);
    } else {
      assert.fail("No messages received");
    }
  });
});
