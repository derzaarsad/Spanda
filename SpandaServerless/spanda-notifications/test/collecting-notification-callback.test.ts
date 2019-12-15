import { Pass, NewTransactionsDecryptor } from "../lib/new-transactions-notification-decoder";
import { EncryptedNewTransactionsNotification } from "../lib/finapi-notifications";
import { Accumulator } from "../lib/notification-callback";
import AesCrypto from "../lib/aes-crypto";

test("collect incoming notifications", async () => {
  const payload = {
    notificationRuleId: 1,
    triggerEvent: "NEW_TRANSACTIONS",
    newTransactions: [],
    callbackHandle: "new-transactions"
  };

  const expected = [
    {
      notificationRuleId: 1,
      triggerEvent: "NEW_TRANSACTIONS",
      newTransactions: [],
      callbackHandle: "new-transactions"
    }
  ];

  const decoder = new Pass();
  const callback = new Accumulator(decoder);
  const status = await callback.accept(payload);

  expect(status).toEqual({ kind: "success" });
  expect(callback.notifications).toEqual(expected);
});

test("apply the decoder on each received notification", async () => {
  const key = "8deec885781c421794ceda8af70a5e63";
  const crypto = new AesCrypto(key);

  const payload: EncryptedNewTransactionsNotification = {
    notificationRuleId: 1,
    triggerEvent: "NEW_TRANSACTIONS",
    callbackHandle: "new-transactions",
    newTransactions: [
      {
        accountId: 1,
        accountName: crypto.encrypt("accountName1"),
        accountNumber: crypto.encrypt("accountNumber1"),
        accountIban: crypto.encrypt("accountIban1"),
        bankName: "bankName1",
        bankConnectionName: crypto.encrypt("bankConnectionName1"),
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

  const expected = [
    {
      notificationRuleId: 1,
      triggerEvent: "NEW_TRANSACTIONS",
      callbackHandle: "new-transactions",
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
    }
  ];

  const decoder = new NewTransactionsDecryptor(crypto);

  const callback = new Accumulator(decoder);
  const status = await callback.accept(payload);

  expect(status).toEqual({ kind: "success" });
  expect(callback.notifications).toEqual(expected);
});
