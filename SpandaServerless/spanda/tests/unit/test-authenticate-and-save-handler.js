'use strict';

/* eslint-env node, mocha */
const chai = require('chai');
const expect = chai.expect;
const forEach = require('mocha-each');
const controller = require('../../controllers/authentication-controller');
const TestUtility = require('../test-utility');

describe('authenticate user handler', function() {
  let logger
  let context
  let testUsername
  let testPassword

  expect(process.env.AZURE_TEST_USER_LOGIN).to.exist;
  expect(process.env.FinAPIClientId).to.exist;
  expect(process.env.FinAPIClientSecret).to.exist;

  let authAndClientSecrets = TestUtility.CreateAuthAndClientSecrets(process.env.FinAPIClientId,process.env.FinAPIClientSecret)

  beforeEach(function() {
    testUsername = process.env.AZURE_TEST_USER_LOGIN;
    testPassword = process.env.AZURE_TEST_USER_LOGIN;

    const winston = require('winston')
    logger = winston.createLogger({ transports: [ new winston.transports.Console() ] })

    context = {}
  })

  forEach(authAndClientSecrets)
  .it('rejects requests with missing parameters', async (authentication,clientSecrets,bankInterface) => {
    const event = {
      body: JSON.stringify({'password': testPassword})
    }

    const result = await controller.authenticateAndSave(event, context, logger, clientSecrets, authentication)

    expect(result).to.be.an('object')
    expect(result.statusCode).to.equal(400)
  })

  forEach(authAndClientSecrets)
  .it('rejects requests with failing authentication', async (authentication,clientSecrets,bankInterface) => {
    const event = {
      body: JSON.stringify({'username': testUsername, 'password': testPassword})
    }

    const failingAuthentication = {
      getPasswordToken: async () => {
        throw 'nada'
      }
    }

    const result = await controller.authenticateAndSave(event, context, logger, clientSecrets, failingAuthentication)

    expect(result).to.be.an('object')
    expect(result.statusCode).to.equal(401)
  })

  forEach(authAndClientSecrets)
  .it('obtains a password token', async (authentication,clientSecrets,bankInterface) => {
    const event = {
      body: JSON.stringify({'username': testUsername, 'password': testPassword})
    }

    const result = await controller.authenticateAndSave(event, context, logger, clientSecrets, authentication)

    expect(result).to.be.an('object')
    expect(result.statusCode).to.equal(200)
    expect(JSON.parse(result.body).access_token).to.exist;
  })
})
