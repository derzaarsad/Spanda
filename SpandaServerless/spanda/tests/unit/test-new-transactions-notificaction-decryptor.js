'use strict';
/* eslint-env node, mocha */

const Decryptor = require('../../lib/region_specific/de/finapi-decryptor.js');
const Decoder = require('../../lib/notification-decoder.js');
const chai = require('chai');

const expect = chai.expect;

describe('notification transformations', function() {
  it('returns the same payload when using pass', async function() {
    const payload = {
      "notificationRuleId": 1,
      "triggerEvent": "NEW_TRANSACTIONS",
      "callbackHandle": "new-transactions"
    }

    const expected = {
      "notificationRuleId": 1,
      "triggerEvent": "NEW_TRANSACTIONS",
      "callbackHandle": "new-transactions"
    }

    const decoder = Decoder.Pass();
    expect(decoder.map(payload)).to.eql(expected);
  })

  it('decrypts a notification encrypted by self', async function() {
    const key = '8deec885781c421794ceda8af70a5e63';
    const decryptor = Decryptor.new(key)

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
        },
        {
          "accountId": 2,
          "accountName": decryptor.encrypt("accountName2"),
          "accountNumber": decryptor.encrypt("accountNumber2"),
          "bankName": "bankName2",
          "bankConnectionName": decryptor.encrypt("bankConnectionName2"),
          "newTransactionsCount": 2,
          "accountIban": null,
          "details": decryptor.encrypt(JSON.stringify({
            "transactionDetails": [
              {
                "id": 1,
                "finapiBookingDate": "2019-11-18",
                "bankBookingDate": "2019-11-18",
                "amount": 69,
                "counterpartName": "your mom",
                "purpose": "cash",
                "isAdjustingEntry": false
              },
              {
                "id": 1,
                "finapiBookingDate": "2019-11-18",
                "bankBookingDate": "2019-11-18",
                "amount": -1,
                "counterpartName": "your dad",
                "purpose": "cash",
                "isAdjustingEntry": false
              }
            ]
          }))
        },
        {
          "accountId": 3,
          "accountIban": undefined,
          "accountName": decryptor.encrypt("accountName3"),
          "accountNumber": decryptor.encrypt("accountNumber3"),
          "bankName": "bankName3",
          "bankConnectionName": decryptor.encrypt("bankConnectionName3"),
          "newTransactionsCount": 1000
        }
      ]
    }

    const expected = {
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
        },
        {
          "accountId": 2,
          "accountName": "accountName2",
          "accountNumber": "accountNumber2",
          "accountIban": null,
          "bankName": "bankName2",
          "bankConnectionName": "bankConnectionName2",
          "newTransactionsCount": 2,
          "details": {
            "transactionDetails": [
              {
                "id": 1,
                "finapiBookingDate": "2019-11-18",
                "bankBookingDate": "2019-11-18",
                "amount": 69,
                "counterpartName": "your mom",
                "purpose": "cash",
                "isAdjustingEntry": false
              },
              {
                "id": 1,
                "finapiBookingDate": "2019-11-18",
                "bankBookingDate": "2019-11-18",
                "amount": -1,
                "counterpartName": "your dad",
                "purpose": "cash",
                "isAdjustingEntry": false
              }
            ]
          }
        },
        {
          "accountId": 3,
          "accountIban": null,
          "accountName": "accountName3",
          "accountNumber": "accountNumber3",
          "bankName": "bankName3",
          "bankConnectionName": "bankConnectionName3",
          "newTransactionsCount": 1000
        }
      ]
    }

    const decoder = Decoder.DecryptNewTransactions(decryptor)
    expect(decoder.map(payload)).to.eql(expected);
  })
});
