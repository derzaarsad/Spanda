'use strict';

/* eslint-env node, mocha */
const chai = require('chai');
const expect = chai.expect;
const TestUtility = require('../test-utility');

const Users = require('../../lib/users');
const BankConnections = require('../../lib/bank-connections');
const Transactions = require('../../lib/transactions')

const controller = require('../../controllers/bank-controller');
const encryptions = require('../../lib/encryptions');

describe('fetch webform info handler', function() {
  this.timeout(10000); // Webform needs time.

  let logger
  let users
  let connections
  let transactions
  let context
  let encrypted
  
  expect(process.env.FinAPIClientId).to.exist;
  expect(process.env.FinAPIClientSecret).to.exist;
  expect(process.env.WEBFORM_ID_FOR_FETCH).to.exist;
  expect(process.env.ACCESS_TOKEN_FOR_FETCH).to.exist;

  let dummyInterfaces = TestUtility.CreateFinApitestInterfaces(process.env.FinAPIClientId,process.env.FinAPIClientSecret);

  beforeEach(function() {
    const winston = require('winston')
    const VoidTransport  = require('../void-transport')
    logger = winston.createLogger({ transports: [ new VoidTransport() ] })

    users = Users.NewInMemoryRepository()
    connections = BankConnections.NewInMemoryRepository()
    transactions = Transactions.NewInMemoryRepository()

    context = {}

    encrypted = encryptions.EncryptText("bearer " + process.env.ACCESS_TOKEN_FOR_FETCH);
  })

  it('rejects a request with could not fetch web form', async function() {
    const rejectedWebId = parseInt(process.env.WEBFORM_ID_FOR_FETCH) + '111'

    const user = users.new('chapu', 'chapu@mischung.net', '+666 666 666', false)
    user.activeWebFormId = rejectedWebId;
    user.activeWebFormAuth = encrypted.iv;
    users.save(user)

    const event = {
      'headers': {
      },
      'pathParameters': {
        'webFormAuth': rejectedWebId + '-' + encrypted.encryptedData
      }
    }

    const result = await controller.fetchWebFormInfo(event, context, logger, dummyInterfaces.bankInterface, users, connections, transactions, encryptions)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(500);
    expect(JSON.parse(result.body).message).to.include('could not fetch web form');
  })

  it('adds a connection to the user', async function() {
    const user = users.new('chapu', 'chapu@mischung.net', '+666 666 666', false)
    user.activeWebFormId = parseInt(process.env.WEBFORM_ID_FOR_FETCH);
    user.activeWebFormAuth = encrypted.iv;
    users.save(user)

    const event = {
      'headers': {
      },
      'pathParameters': {
        'webFormAuth': process.env.WEBFORM_ID_FOR_FETCH + '-' + encrypted.encryptedData
      }
    }

    const result = await controller.fetchWebFormInfo(event, context, logger, dummyInterfaces.bankInterface, users, connections, transactions, encryptions)
    expect(result.statusCode).to.equal(200);
    expect(result).to.be.an('object');

    const responseBody = JSON.parse(result.body)
    expect(responseBody, 'the response body appears to be undefined').to.be.ok
    expect(responseBody).to.be.an('object', 'expected the response body to be an object');
    expect(responseBody.id).to.be.an('number', 'expected the response id to be a number');
    expect(responseBody.bankId).to.be.an('number', 'expected the response bankId to be a number');

    const bankConnectionId = responseBody.id

    const user_ = await users.findById('chapu')
    expect(user_, 'no user found for the given username').to.be.ok
    expect(user_.bankConnectionIds).to.include(bankConnectionId, 'the connection ids were not updated')

    const connection = await connections.findById(bankConnectionId)
    expect(connection, 'the connection was not created').to.be.ok
    expect(connection.bankAccountIds[0]).to.be.an('number', 'expected the bankAccountIds element to be a number');

    const transactions_ = await transactions.findByAccountIds(connection.bankAccountIds)
    expect(transactions_).to.exist;
    expect(transactions_.length).to.not.equal(0);
    expect(transactions_[0].id).to.exist;
    expect(transactions_[0].accountId).to.equal(connection.bankAccountIds[0]);
    expect(transactions_[0].amount).to.exist;
  })
})
