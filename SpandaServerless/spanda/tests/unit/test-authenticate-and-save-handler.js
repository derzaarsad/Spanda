'use strict';

/* eslint-env node, mocha */
const chai = require('chai');
const expect = chai.expect;

const ClientSecrets = require('../../lib/client-secrets');

const controller = require('../../controllers/authentication-controller');

describe('register and save user handler', function() {
  let logger
  let clientSecrets
  let authentication
  let context

  expect(process.env.AZURE_TEST_USER_LOGIN).to.exist;

  beforeEach(function() {
    const winston = require('winston')
    logger = winston.createLogger({ transports: [ new winston.transports.Console() ] })

    clientSecrets = ClientSecrets.Resolved('client-id', 'client-secret')
    authentication = {
      getPasswordToken: async () => {
        return {
          'auth': true
        }
      }
    }

    context = {}
  })

  it('rejects requests with missing parameters', async function() {
    const event = {
      body: JSON.stringify({'password': 'secret'})
    }

    const result = await controller.authenticateAndSave(event, context, logger, clientSecrets, authentication)

    expect(result).to.be.an('object')
    expect(result.statusCode).to.equal(400)
  })

  it('rejects requests with failing authentication', async function() {
    const event = {
      body: JSON.stringify({'username': 'user', 'password': 'secret'})
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

  it('obtains a password token', async function() {
    const event = {
      body: JSON.stringify({'username': 'user', 'password': 'secret'})
    }

    const result = await controller.authenticateAndSave(event, context, logger, clientSecrets, authentication)

    expect(result).to.be.an('object')
    expect(result.statusCode).to.equal(200)
    expect(JSON.parse(result.body).auth).to.equal(true)
  })
})
