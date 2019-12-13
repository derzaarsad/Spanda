'use strict';
/* eslint-env node, mocha */

const uuidv4 = require('uuid/v4');
const RuleHandle = require('../../lib/rule-handle');

const Crypto = require('../../lib/region_specific/de/finapi-crypto.js');
const Decoder = require('../../lib/notification-decoder.js');
const Callback = require('../../lib/notification-callback.js');

const winston = require('winston')
const VoidTransport  = require('../void-transport')

const chai = require('chai');

const expect = chai.expect;

const mockSNS = () => {
  let messages = [];

  return {
    publish: (params, callback) => {
      messages.push(params);
      callback(null, { 'ok': true });
    },

    messages: messages
  }
}

describe('SNS forwarding callback handler', function() {
  let logger
  let crypto
  let handles

  beforeEach(function() {
    const key = '8deec885781c421794ceda8af70a5e63';

    handles = RuleHandle.NewInMemoryRepository(uuidv4);
    crypto = Crypto.new(key);
    logger = winston.createLogger({ transports: [ new VoidTransport() ] })
  })

  it('decrypts and forwards notifications to a topic successfully', async function() {
    const decoder = Decoder.DecryptNewTransactions(crypto);

    const handle = handles.new(1, 1, 'NEW_TRANSACTIONS', {});
    await handles.save(handle);

    const notification = {
      "notificationRuleId": 1,
      "triggerEvent": "NEW_TRANSACTIONS",
      "callbackHandle": handle.id,
      "newTransactions": [
        {
          "accountId": 1,
          "accountName": crypto.encrypt("accountName"),
          "accountNumber": crypto.encrypt("accountNumber"),
          "accountIban": crypto.encrypt("accountIban"),
          "bankName": "bankName1",
          "bankConnectionName": crypto.encrypt("bankConnectionName"),
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

    const sns = mockSNS();

    const callback = Callback.NewSNSPublisher(decoder, handles, sns, 'topic', logger);
    const status = await callback.accept(notification);
    const message = sns.messages.pop();

    expect(status).to.eql({ kind: 'success'} );
    expect(message).to.have.property('Message');
    expect(message).to.have.property('TopicArn');
    expect(message).to.have.property('MessageStructure');

    const body = JSON.parse(message.Message);
    expect(body).to.have.property('newTransactions');
    expect(body.newTransactions[0]).to.have.property('accountName', 'accountName');
  });

  it('fails when rule handle is not found', async function() {
    const decoder = Decoder.DecryptNewTransactions(crypto);

    const handle = handles.new(1, 1, 'NEW_TRANSACTIONS', {});

    const notification = {
      "notificationRuleId": 1,
      "triggerEvent": "NEW_TRANSACTIONS",
      "callbackHandle": handle.id,
      "newTransactions": []
    }

    const sns = mockSNS();

    const callback = Callback.NewSNSPublisher(decoder, handles, sns, 'topic', logger);
    const status = await callback.accept(notification);

    expect(status).to.have.property('kind', 'failure');
  });
});
