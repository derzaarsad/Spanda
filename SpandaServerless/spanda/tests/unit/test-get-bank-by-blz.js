'use strict';
/* eslint-env node, mocha */

const chai = require('chai');
const expect = chai.expect;

const ClientSecrets = require('../../lib/client-secrets');
const handler = require('../../controllers/bank-controller');

describe('get banks by BLZ handler', function() {
  let logger

  beforeEach(function() {
    const winston = require('winston')
    logger = winston.createLogger({ transports: [ new winston.transports.Console() ] })
  })

  it('rejects a request with an invalid BLZ', async function() {
    const context = {}
    const clientSecrets = {}
    const authentication = {}
    const finapi = {}

    const event = {
      'pathParameters': {
        'blz': 'invalid'
      }
    }

    const result = await handler.getBankByBLZ(event, context, logger, clientSecrets, authentication, finapi)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(400);
    expect(JSON.parse(result.body).message).to.include('invalid');
  })

  it('rejects request with failing authorization', async function() {
    const context = {}
    const clientSecrets = ClientSecrets.Resolved('test-id', 'test-secret')
    const finapi = {}

    const authentication = {
      getClientCredentialsToken: async () => {
        throw 'nada'
      }
    }

    const event = {
      'pathParameters': {
        'blz': '00000000'
      }
    }

    const result = await handler.getBankByBLZ(event, context, logger, clientSecrets, authentication, finapi)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(401);
  })

  it('lists banks after fetching an authorization token', async function() {
    const context = {}
    const clientSecrets = ClientSecrets.Resolved('test-id', 'test-secret')

    const authentication = {
      getClientCredentialsToken: async () => {
        return {
          access_token: 'test-token'
        }
      }
    }

    const finapi = {
      listBanksByBLZ: async () => {
        return [
          {
            'bank': 'test'
          }
        ]
      }
    }

    const event = {
      'pathParameters': {
        'blz': '00000000'
      }
    }

    const result = await handler.getBankByBLZ(event, context, logger, clientSecrets, authentication, finapi)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(200);
  })
})
