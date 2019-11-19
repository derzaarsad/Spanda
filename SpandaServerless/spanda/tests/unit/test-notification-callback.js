'use strict';
/* eslint-env node, mocha */

const Decryptor = require('../../lib/region_specific/de/finapi-decryptor.js');
const Decoder = require('../../lib/notification-decoder.js');
const Callback = require('../../lib/notification-callback.js');

const chai = require('chai');

const expect = chai.expect;

describe('collector notification callback', function() {
  it('collects incoming notifications', async function() {
    const payload = {
      "notificationRuleId": 1,
      "triggerEvent": "NEW_TRANSACTIONS",
      "newTransactions": [],
      "callbackHandle": "new-transactions"
    }

    const expected = [
      {
        "notificationRuleId": 1,
        "triggerEvent": "NEW_TRANSACTIONS",
        "newTransactions": [],
        "callbackHandle": "new-transactions"
      }
    ]

    const callback = Callback.NewAccumulator(Decoder.Pass());
    await callback.accept(payload);

    expect(callback.notifications).to.eql(expected);
  })

  it('applies the decoder on each received notification', async function() {
    const key = '8deec885781c421794ceda8af70a5e63';
    const decryptor = Decryptor.new(key);

    const payload = {
      "notificationRuleId": 1,
      "triggerEvent": "NEW_TRANSACTIONS",
      "callbackHandle": "new-transactions",
      "newTransactions": [
        {
          "accountId": 1,
          "accountName": decryptor.encrypt("accountName1"),
          "accountNumber": decryptor.encrypt("accountNumber1"),
          "accountIban": decryptor.encrypt("accountIban1"),
          "bankName": "bankName1",
          "bankConnectionName": decryptor.encrypt("bankConnectionName1"),
          "newTransactionsCount": 1,
          "details": decryptor.encrypt(JSON.stringify({
            "transactionDetails": [
              {
                "id": 1,
                "finapiBookingDate": "2019-11-18",
                "bankBookingDate": "2019-11-18",
                "amount": 200,
                "counterpartName": "your uncle",
                "purpose": "cash",
                "isAdjustingEntry": false
              }
            ]
          }))
        }
      ]
    }

    const expected = [
      {
        "notificationRuleId": 1,
        "triggerEvent": "NEW_TRANSACTIONS",
        "callbackHandle": "new-transactions",
        "newTransactions": [
          {
            "accountId": 1,
            "accountName": "accountName1",
            "accountNumber": "accountNumber1",
            "accountIban": "accountIban1",
            "bankName": "bankName1",
            "bankConnectionName": "bankConnectionName1",
            "newTransactionsCount": 1,
            "details": {
              "transactionDetails": [
                {
                  "id": 1,
                  "finapiBookingDate": "2019-11-18",
                  "bankBookingDate": "2019-11-18",
                  "amount": 200,
                  "counterpartName": "your uncle",
                  "purpose": "cash",
                  "isAdjustingEntry": false
                }
              ]
            }
          }
        ]
      }
    ]


    const decoder = Decoder.DecryptNewTransactions(decryptor);

    const callback = Callback.NewAccumulator(decoder);
    await callback.accept(payload);
    expect(callback.notifications).to.eql(expected);
  })
})
