'use strict';

/* eslint-env node, mocha */
const chai = require('chai');
const expect = chai.expect;

const Users = require('../../lib/users');
const BankConnections = require('../../lib/bank-connections');

const controller = require('../../controllers/bank-controller');
const TestUtility = require('../test-utility');

describe('get webform id', function() {
  let logger
  let users
  let context
  let testUsername
  let testValidEmail
  let testValidPhone

  let authAndClientSecrets = TestUtility.CreateUnittestInterfaces();

  beforeEach(function() {
    testUsername = 'chapu';
    testValidEmail = 'chapu@chapu.com'
    testValidPhone = '+66 6666'

    const winston = require('winston')
    const VoidTransport  = require('../void-transport')
    logger = winston.createLogger({ transports: [ new VoidTransport() ] })

    users = Users.NewInMemoryRepository()

    context = {}
  })

  it('rejects requests with failing authentication', async () => {
    users.save(users.new(testUsername, testValidEmail, testValidPhone, false))

    const event = {
      'headers': {
        'Content-Type': 'application/json'
      },

      'body': JSON.stringify({ 'bankId': 123545 })
    }

    const result = await controller.getWebformId(event, context, logger, authAndClientSecrets.bankInterface, users)

    expect(result).to.be.an('object')
    expect(result.statusCode).to.equal(401)
  })

  it('rejects requests because user is not available', async () => {

    const event = {
      'headers': {
        'Authorization': 'bearer 12345678',
        'Content-Type': 'application/json'
      },

      'body': JSON.stringify({ 'bankId': 123545 })
    }

    const result = await controller.getWebformId(event, context, logger, authAndClientSecrets.bankInterface, users)

    expect(result).to.be.an('object')
    expect(result.statusCode).to.equal(401)
  })

  it('rejects requests because user save failed', async () => {
    const failingUsers = {
      findById: async (id) => {
        return {
          'username': testUsername
        }
      },

      save: async (user) => {
        throw 'nada'
      }
    }

    const event = {
      'headers': {
        'Authorization': 'bearer 12345678',
        'Content-Type': 'application/json'
      },

      'body': JSON.stringify({ 'bankId': 123545 })
    }

    const result = await controller.getWebformId(event, context, logger, authAndClientSecrets.bankInterface, failingUsers)

    expect(result).to.be.an('object')
    expect(result.statusCode).to.equal(500)
  })

  it('return webform location', async function() {
    users.save(users.new(testUsername, testValidEmail, testValidPhone, false))

    const event = {
      'headers': {
        'Authorization': 'bearer 12345678',
        'Content-Type': 'application/json'
      },

      'body': JSON.stringify({ 'bankId': 123545 })
    }

    const result = await controller.getWebformId(event, context, logger, authAndClientSecrets.bankInterface, users)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(200);
    expect(JSON.parse(result.body).location).to.be.an('string');
    expect(JSON.parse(result.body).webFormAuth).to.be.an('string');

    expect(JSON.parse(result.body).location).to.equal('testlocation');
  })

})
