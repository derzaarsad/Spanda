'use strict';

/* eslint-env node, mocha */
const chai = require('chai');
const expect = chai.expect;

const Users = require('../../lib/users');
const BankConnections = require('../../lib/bank-connections');

const controller = require('../../controllers/bank-controller');
const encryptions = require('../../lib/encryptions');

describe('fetch webform info handler', function() {
  let logger
  let users
  let connections
  let context

  beforeEach(function() {
    const winston = require('winston')
    const VoidTransport  = require('../void-transport')
    logger = winston.createLogger({ transports: [ new VoidTransport() ] })

    users = Users.NewInMemoryRepository()
    connections = BankConnections.NewInMemoryRepository()

    context = {}
  })

  it('rejects a request with missing webFormAuth', async function() {
    const finapi = {}

    const event = {
      'headers': {
      },
      'pathParameters': {
      }
    }

    const result = await controller.fetchWebFormInfo(event, context, logger, finapi, users, connections, encryptions)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(500);
    expect(JSON.parse(result.body).message).to.include('no webFormAuth');
  })

  it('rejects a request with no user found', async function() {
    const finapi = {}

    const event = {
      'headers': {
      },
      'pathParameters': {
        'webFormAuth': '2934-5jkntkzt5nj53zi9975'
      }
    }

    const result = await controller.fetchWebFormInfo(event, context, logger, finapi, users, connections, encryptions)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(500);
    expect(JSON.parse(result.body).message).to.include('no user found');
  })

  it('rejects a request with could not fetch web form', async function() {
    const encrypted = encryptions.EncryptText("bearer 5jkntkzt5nj53zi99754563nb3b64zb");
    const user = users.new('chapu', 'chapu@mischung.net', '+666 666 666', false)
    user.activeWebFormId = 2934;
    user.activeWebFormAuth = encrypted.iv;
    await users.save(user)

    const finapi = {
      fetchWebForm: async (authorization, formId) => {
        throw 'nada'
      }
    }

    const event = {
      'headers': {
      },
      'pathParameters': {
        'webFormAuth': '2934-' + encrypted.encryptedData
      }
    }

    const result = await controller.fetchWebFormInfo(event, context, logger, finapi, users, connections, encryptions)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(500);
    expect(JSON.parse(result.body).message).to.include('could not fetch web form');
  })

  it('rejects a request because of empty body', async function() {
    const encrypted = encryptions.EncryptText("bearer 5jkntkzt5nj53zi99754563nb3b64zb");
    const user = users.new('chapu', 'chapu@mischung.net', '+666 666 666', false)
    user.activeWebFormId = 2934;
    user.activeWebFormAuth = encrypted.iv;
    await users.save(user)

    const finapi = {
      fetchWebForm: async (authorization, formId) => {
        return {}
      }
    }

    const event = {
      'headers': {
      },
      'pathParameters': {
        'webFormAuth': '2934-' + encrypted.encryptedData
      }
    }

    const result = await controller.fetchWebFormInfo(event, context, logger, finapi, users, connections, encryptions)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(500);
    expect(JSON.parse(result.body).message).to.include('empty body');
  })

  it('adds a connection to the user', async function() {
    let access_token = 'bearer 5jkntkzt5nj53zi99754563nb3b64zb';
    const encrypted = encryptions.EncryptText(access_token);
    const user = users.new('chapu', 'chapu@mischung.net', '+666 666 666', false)
    user.activeWebFormId = 2934;
    user.activeWebFormAuth = encrypted.iv;
    await users.save(user)

    const finapi = {

      fetchWebForm: async (authorization, formId) => {
        if(authorization !== access_token) {
          return {}
        }
        return {
          serviceResponseBody: '{ "id": 1, "bankId": 2, "accountIds": [ 3, 4, 5 ] }'
        }
      }
    }

    const event = {
      'headers': {
      },
      'pathParameters': {
        'webFormAuth': '2934-' + encrypted.encryptedData
      }
    }

    const result = await controller.fetchWebFormInfo(event, context, logger, finapi, users, connections, encryptions)
    expect(result.statusCode).to.equal(200);
    expect(result).to.be.an('object');

    const responseBody = JSON.parse(result.body)
    expect(responseBody, 'the response body appears to be undefined').to.be.ok
    expect(responseBody).to.be.an('object', 'expected the response body to be an object');
    expect(responseBody.id).to.equal(1, 'the bank connection id differs from the given one')
    expect(responseBody.bankId).to.equal(2, 'the bank id differs from the given one')

    const user_ = await users.findById('chapu')
    expect(user_, 'no user found for the given username').to.be.ok
    expect(user_.bankConnectionIds).to.include(1, 'the connection ids were not updated')

    const connection = await connections.findById(1)
    expect(connection, 'the connection was not created').to.be.ok
    expect(connection.bankAccountIds).to.be.an('array').that.includes.members([3, 4, 5], 'the account ids were not assigned to the bank connection')
  })
})
