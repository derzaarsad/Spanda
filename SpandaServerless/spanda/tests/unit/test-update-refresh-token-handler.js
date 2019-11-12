'use strict';

/* eslint-env node, mocha */
const chai = require('chai');
const expect = chai.expect;

const ClientSecrets = require('../../lib/client-secrets');

const controller = require('../../controllers/authentication-controller');

describe('get refresh token handler', function() {
  let logger
  let clientSecrets
  let authentication
  let context

  beforeEach(function() {
    const winston = require('winston')
    const VoidTransport  = require('./void-transport')
    logger = winston.createLogger({ transports: [ new VoidTransport() ] })

    clientSecrets = ClientSecrets.Resolved('client-id', 'client-secret')
    authentication = {
      getRefreshToken: async () => {
        return {
          'auth': true
        }
      }
    }

    context = {}
  })

  it('rejects requests with missing parameters', async function() {
    const event = {
      body: JSON.stringify({})
    }

    const result = await controller.updateRefreshToken(event, context, logger, clientSecrets, authentication)

    expect(result).to.be.an('object')
    expect(result.statusCode).to.equal(400)
  })

  it('rejects requests with failing authentication', async function() {
    const event = {
      body: JSON.stringify({'refresh_token': 'secret'})
    }

    const failingAuthentication = {
      getRefreshToken: async () => {
        throw 'nada'
      }
    }

    const result = await controller.updateRefreshToken(event, context, logger, clientSecrets, failingAuthentication)

    expect(result).to.be.an('object')
    expect(result.statusCode).to.equal(401)
  })

  it('obtains a refresh token', async function() {
    const event = {
      body: JSON.stringify({'refresh_token': 'secret'})
    }

    const result = await controller.updateRefreshToken(event, context, logger, clientSecrets, authentication)

    expect(result).to.be.an('object')
    expect(result.statusCode).to.equal(200)
    expect(JSON.parse(result.body).auth).to.equal(true)
  })
})

