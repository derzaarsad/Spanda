'use strict';

/* eslint-env node, mocha */
const chai = require('chai');
const expect = chai.expect;

const Users = require('../../lib/users');
const BankConnections = require('../../lib/bank-connections');

const controller = require('../../controllers/bank-controller');

describe('fetch webform info handler', function() {
  let logger
  let users
  let connections
  let context

  beforeEach(function() {
    const winston = require('winston')
    logger = winston.createLogger({ transports: [ new winston.transports.Console() ] })

    users = Users.NewInMemoryRepository()
    connections = BankConnections.NewInMemoryRepository()

    context = {}
  })

  it('rejects a request with missing authorization', async function() {
    const finapi = {}

    const event = {
      'headers': {
      }
    }

    const result = await controller.fetchWebFormInfo(event, context, logger, finapi, users, connections)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(401);
    expect(JSON.parse(result.body).message).to.include('unauthorized');
  })

  it('rejects a request with wrong authorization', async function() {
    const finapi = {
      userInfo: async () => {
        throw 'nada'
      }
    }

    const event = {
      'headers': {
      }
    }

    const result = await controller.fetchWebFormInfo(event, context, logger, finapi, users, connections)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(401);
    expect(JSON.parse(result.body).message).to.include('unauthorized');
  })

  it('rejects a request with no webform id', async function() {
    const finapi = {}

    const event = {
      'headers': {
        'Authorization': 'authorized'
      },
      'pathParameters': {
      }
    }

    const result = await controller.fetchWebFormInfo(event, context, logger, finapi, users, connections)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(400);
    expect(JSON.parse(result.body).message).to.include('no webform id given');
  })

  it('rejects a request referring to a missing user', async function() {
    const finapi = {
      userInfo: async () => {
        return { 'id': 'chapu' }
      }
    }

    const event = {
      'headers': {
        'Authorization': 'authorized'
      },
      'pathParameters': {
        'webFormId': '5'
      }
    }

    const result = await controller.fetchWebFormInfo(event, context, logger, finapi, users, connections)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(404);
    expect(JSON.parse(result.body).message).to.include('user not found');
  })

  it('adds a connection to the user', async function() {
    users.save(users.new('chapu', 'chapu@mischung.net', '666', false))

    const finapi = {
      userInfo: async () => {
        return { 'id': 'chapu' }
      },

      fetchWebForm: async () => {
        return {
          serviceResponseBody: {
            'id': 1,
            'bankId': 2,
            'accountIds': [ 3, 4, 5 ]
          }
        }
      }
    }

    const event = {
      'headers': {
        'Authorization': 'authorized'
      },
      'pathParameters': {
        'webFormId': '69'
      }
    }

    const result = await controller.fetchWebFormInfo(event, context, logger, finapi, users, connections)
    expect(result.statusCode).to.equal(200);
    expect(result).to.be.an('object');

    const responseBody = JSON.parse(result.body)
    expect(responseBody, 'the response body appears to be undefined').to.be.ok
    expect(responseBody).to.be.an('object', 'expected the response body to be an object');
    expect(responseBody.id).to.equal(1, 'the bank connection id differs from the given one')
    expect(responseBody.bankId).to.equal(2, 'the bank id differs from the given one')

    const user = await users.findById('chapu')
    expect(user, 'no user found for the given username').to.be.ok
    expect(user.bankConnectionIds).to.include(1, 'the connection ids were not updated')

    const connection = await connections.findById(1)
    expect(connection, 'the connection was not created').to.be.ok
    expect(connection.bankAccountIds).to.be.an('array').that.includes.members([3, 4, 5], 'the account ids were not assigned to the bank connection')
  })
})
