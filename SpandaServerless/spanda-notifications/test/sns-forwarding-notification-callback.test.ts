import VoidTransport from "./void-transport";
import winston = require("winston");
import AesCrypto from "../lib/aes-crypto";

import { v4 as uuid } from "uuid";
import { InMemoryRuleHandleRepository } from "../lib/in-memory-rule-handle-repository";
import RuleHandleFactory from "../lib/rule-handle-factory";
import Crypto from "../lib/crypto";
import RuleHandleRepository from "../lib/rule-handle-repository";
import UUIDRuleHandleFactory from "../lib/uuid-rule-handle-factory";
import { NewTransactionsDecryptor } from "../lib/new-transactions-notification-decoder";
import { NewTransactionsSNSPublisher } from "../lib/notification-callback";
import MockSNSPublisher from "../lib/mock-sns-publisher";
import {
  EncryptedNewTransactionsNotification,
  DecryptedNewTransactionsNotification
} from "../lib/finapi-notifications";

let factory: RuleHandleFactory;
let logger: winston.Logger;
let crypto: Crypto;
let handles: RuleHandleRepository;
let sns: MockSNSPublisher;

beforeEach(() => {
  const key = "8deec885781c421794ceda8af70a5e63";

  factory = new UUIDRuleHandleFactory(uuid);
  handles = new InMemoryRuleHandleRepository();
  crypto = new AesCrypto(key);
  sns = new MockSNSPublisher();
  logger = winston.createLogger({ transports: [new VoidTransport()] });
});

test("decrypt and forwards notifications to a topic successfully", async () => {
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
  const message = sns.publishedData.pop()!;

  expect(status).toEqual({ kind: "success" });

  const body = JSON.parse(message.message) as DecryptedNewTransactionsNotification;
  expect(body).toHaveProperty("newTransactions");
  expect(body.newTransactions[0]).toHaveProperty("accountName", "accountName");
});

test("fails when rule handle is not found", async () => {
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

  expect(status).toHaveProperty("kind", "failure");
});
