'use strict';

/* eslint-env node, mocha */
const chai = require('chai');
const expect = chai.expect;
const TestUtility = require('../test-utility');

const Users = require('../../lib/users');
const BankConnections = require('../../lib/bank-connections');

const controller = require('../../controllers/bank-controller');
const encryptions = require('../../lib/encryptions');

describe('fetch webform info handler', function() {
  this.timeout(10000); // Webform needs time.

  let logger
  let users
  let connections
  let context
  let encrypted
  
  expect(process.env.FinAPIClientId).to.exist;
  expect(process.env.FinAPIClientSecret).to.exist;
  expect(process.env.WEBFORM_ID).to.exist;
  expect(process.env.ACCESS_TOKEN).to.exist;

  let dummyInterfaces = TestUtility.CreateFinApitestInterfaces(process.env.FinAPIClientId,process.env.FinAPIClientSecret);

  beforeEach(function() {
    const winston = require('winston')
    const VoidTransport  = require('../void-transport')
    logger = winston.createLogger({ transports: [ new VoidTransport() ] })

    users = Users.NewInMemoryRepository()
    connections = BankConnections.NewInMemoryRepository()

    context = {}

    encrypted = encryptions.EncryptText("bearer " + process.env.ACCESS_TOKEN);
  })

  it('rejects a request with could not fetch web form', async function() {
    const rejectedWebId = parseInt(process.env.WEBFORM_ID) + '111'

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

    const result = await controller.fetchWebFormInfo(event, context, logger, dummyInterfaces.bankInterface, users, connections, encryptions)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(500);
    expect(JSON.parse(result.body).message).to.include('could not fetch web form');
  })

  it('adds a connection to the user', async function() {
    const user = users.new('chapu', 'chapu@mischung.net', '+666 666 666', false)
    user.activeWebFormId = parseInt(process.env.WEBFORM_ID);
    user.activeWebFormAuth = encrypted.iv;
    users.save(user)

    const event = {
      'headers': {
      },
      'pathParameters': {
        'webFormAuth': process.env.WEBFORM_ID + '-' + encrypted.encryptedData
      }
    }

    const result = await controller.fetchWebFormInfo(event, context, logger, dummyInterfaces.bankInterface, users, connections, encryptions)
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
  })
})
