import chai from "chai";
const expect = chai.expect;

import winston = require("winston");
import VoidTransport from "../../src/void-transport";

import { AesCrypto } from "../../src/crypto";
import { v4 as uuid } from "uuid";
import { InMemoryRuleHandleRepository } from "../../src/rule-handle-repository";
import { Crypto } from "../../src/crypto";
import { RuleHandleRepository } from "../../src/rule-handle-repository";
import { RuleHandleFactory, UUIDRuleHandleFactory } from "../../src/rule-handle";
import { NewTransactionsDecryptor } from "../../src/notification-decoder";
import { NewTransactionsSNSPublisher } from "../../src/notification-callback";
import { MockSNSPublisher } from "../../src/sns-publisher";
import { EncryptedNewTransactionsNotification } from "../../src/finapi-notifications";

let factory: RuleHandleFactory;
let logger: winston.Logger;
let crypto: Crypto;
let handles: RuleHandleRepository;
let sns: MockSNSPublisher;

describe("unit: SNS forwarding notification callback", () => {
  beforeEach(() => {
    const key = "8deec885781c421794ceda8af70a5e63";

    factory = new UUIDRuleHandleFactory(uuid);
    handles = new InMemoryRuleHandleRepository();
    crypto = new AesCrypto(key);
    sns = new MockSNSPublisher();
    logger = winston.createLogger({ transports: [new VoidTransport()] });
  });

  it("decrypt and forwards notifications to a topic successfully", async () => {
    const decoder = new NewTransactionsDecryptor(crypto);

    const handle = factory.create(1, "chapu", "NEW_TRANSACTIONS", {});
    await handles.save(handle);

    const notification: EncryptedNewTransactionsNotification = {
      notificationRuleId: 1,
      triggerEvent: "NEW_TRANSACTIONS",
      callbackHandle: handle.id,
      newTransactions: [
        {
          accountId: 1,
          accountName: crypto.encrypt("accountName"),
          accountNumber: crypto.encrypt("accountNumber"),
          accountIban: crypto.encrypt("accountIban"),
          bankName: "bankName1",
          bankConnectionName: crypto.encrypt("bankConnectionName"),
          newTransactionsCount: 1,
          details: crypto.encrypt(
            JSON.stringify({
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
            })
          )
        }
      ]
    };

    const callback = new NewTransactionsSNSPublisher(decoder, handles, sns, "topic", logger);
    const status = await callback.accept(notification);
    const publishMessageInput = sns.publishedData.pop()!;

    expect(status).to.eql({ kind: "success" });

    const body = publishMessageInput.message;
    expect(body).to.haveOwnProperty("newTransactions");
    expect(body.newTransactions[0]).to.haveOwnProperty("accountName", "accountName");
  });

  it("fails when rule handle is not found", async () => {
    const decoder = new NewTransactionsDecryptor(crypto);

    const handle = factory.create(1, "chapu", "NEW_TRANSACTIONS", {});

    const notification: EncryptedNewTransactionsNotification = {
      notificationRuleId: 1,
      triggerEvent: "NEW_TRANSACTIONS",
      callbackHandle: handle.id,
      newTransactions: []
    };

    const callback = new NewTransactionsSNSPublisher(decoder, handles, sns, "topic", logger);
    const status = await callback.accept(notification);

    expect(status).to.haveOwnProperty("kind", "failure");
  });
});
