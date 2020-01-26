import chai from "chai";
const expect = chai.expect;

import { NewTransactionsDecryptor } from "../../src/notification-decoder";
import { AesCrypto } from "../../src/crypto";
import {
  DecryptedNewTransactionsNotification,
  EncryptedNewTransactionsNotification
} from "../../src/finapi-notifications";

const key = "covfefe";
const crypto = new AesCrypto(key);
const decryptor = new NewTransactionsDecryptor(crypto);

const cleartextNotification: DecryptedNewTransactionsNotification = {
  notificationRuleId: 1,
  triggerEvent: "NEW_TRANSACTIONS",
  callbackHandle: "test-user|2abb6653-7f8d-400d-9f79-2fc8fdc73fd6",
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

const body =
  '{"notificationRuleId":1,"triggerEvent":"NEW_TRANSACTIONS","callbackHandle":"test-user|2abb6653-7f8d-400d-9f79-2fc8fdc73fd6","newTransactions":[{"accountId":1,"bankName":"bankName1","newTransactionsCount":1,"accountName":"1E1zk9iQb+yf69e1F/FDiA==","accountNumber":"8PzDi2xNeA0pdLxX05Sclg==","accountIban":"etPo+olDpnEoxWwskrnG9w==","bankConnectionName":"UlUNL4squISERU10QJdaoC4pP9ByYH4jIAAS1o7N/Aw=","details":"R+Tl4rVcnPFohhuMVO6OscASEw9eEjCFr0oOF72P50Y4dQwkGNNaIKnAfHTciV7MCe4oeWXBS6uCNZKsm1Id0qkYCWO0piyXXbgAQCDLB36EDXyrygdJ99w4QTUMqDi2Uj7UQOy+HC91BCVQOWSdDPIXUrnRYVA7FvyZZk27mIBrFlpses8DK193e1DZiYV3wWBNEBuwf3IoU+Id6iufSUA4aR0mCVVuekkS/MykJfEvrY3MgLTfagEkTkzMnT7q"}]}';

describe("New transactions notifiction decryptor", () => {
  it("decrypts a message body received from API gateway", async function() {
    const decrypted = decryptor.map(JSON.parse(body) as EncryptedNewTransactionsNotification);
    expect(decrypted).is.eql(cleartextNotification);
  });
});
