'use strict';
/* eslint-env node, mocha */

const Crypto = require('../../lib/region_specific/de/finapi-crypto.js');
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
    const status = await callback.accept(payload);

    expect(status).to.eql({kind: 'success'});
    expect(callback.notifications).to.eql(expected);
  })

  it('applies the decoder on each received notification', async function() {
    const key = '8deec885781c421794ceda8af70a5e63';
    const crypto = Crypto.new(key);

    const payload = {
      "notificationRuleId": 1,
      "triggerEvent": "NEW_TRANSACTIONS",
      "callbackHandle": "new-transactions",
      "newTransactions": [
        {
          "accountId": 1,
          "accountName": crypto.encrypt("accountName1"),
          "accountNumber": crypto.encrypt("accountNumber1"),
          "accountIban": crypto.encrypt("accountIban1"),
          "bankName": "bankName1",
          "bankConnectionName": crypto.encrypt("bankConnectionName1"),
          "newTransactionsCount": 1,
          "details": crypto.encrypt(JSON.stringify({
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

    const decoder = Decoder.DecryptNewTransactions(crypto);

    const callback = Callback.NewAccumulator(decoder);
    const status = await callback.accept(payload);

    expect(status).to.eql({kind: 'success'});
    expect(callback.notifications).to.eql(expected);
  })
})
