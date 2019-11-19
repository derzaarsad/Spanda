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
  let encryptions

  beforeEach(function() {
    testUsername = 'chapu';
    testValidEmail = 'chapu@chapu.com'
    testValidPhone = '+66 6666'

    const winston = require('winston')
    const VoidTransport  = require('../void-transport')
    logger = winston.createLogger({ transports: [ new VoidTransport() ] })

    users = Users.NewInMemoryRepository()
    encryptions = require('../../lib/encryptions')

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

    const result = await controller.getWebformId(event, context, logger, authAndClientSecrets.bankInterface, users, encryptions)

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

    const result = await controller.getWebformId(event, context, logger, authAndClientSecrets.bankInterface, users, encryptions)

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

    const result = await controller.getWebformId(event, context, logger, authAndClientSecrets.bankInterface, failingUsers, encryptions)

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

    const result = await controller.getWebformId(event, context, logger, authAndClientSecrets.bankInterface, users, encryptions)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(200);
    expect(JSON.parse(result.body).location).to.be.an('string');
    expect(JSON.parse(result.body).webFormAuth).to.be.an('string');

    expect(JSON.parse(result.body).location).to.equal('testlocation');
    expect(JSON.parse(result.body).webFormAuth.split("-").length).to.equal(2);
    expect(JSON.parse(result.body).webFormAuth.split("-")[0]).to.equal('2934');
    expect(JSON.parse(result.body).webFormAuth.split("-")[1]).to.not.equal(event.headers.Authorization);

    // this test proves whether the right data is written to database
    let user = await users.findByWebForm(2934);
    expect(JSON.parse(result.body).webFormAuth.split("-")[0]).to.equal(user.activeWebFormId);
    let res = encryptions.DecryptText({ iv: user.activeWebFormAuth, encryptedData: JSON.parse(result.body).webFormAuth.split("-")[1] })
    expect(res).to.equal(event.headers.Authorization);
  })

})
