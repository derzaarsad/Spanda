'use strict';
/* eslint-env node, mocha */

const chai = require('chai');
const expect = chai.expect;

const controller = require('../../controllers/authentication-controller');

describe('isUserAuthenticated handler', function() {
  let logger

  beforeEach(function() {
    const winston = require('winston')
    const VoidTransport  = require('./void-transport')
    logger = winston.createLogger({ transports: [ new VoidTransport() ] })
  })

  it('verifies an authorized request', async function() {
    const bankInterface = {
      userInfo: async () => {
        return 'ok';
      },
    }

    const event = {
      headers: {
        "Authorization": "bearer 5325626"
      }
    };

    const result = await controller.isUserAuthenticated(event, {}, logger, bankInterface)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(200);
    expect(result.body).to.be.an('string');
    expect(result.body).to.equal(JSON.stringify('ok'));
  });

  it('rejects an unauthorized request', async function() {
    const bankInterface = {
      userInfo: async () => {
        return 'ok';
      },
    }

    const event = { headers: {} };
    const result = await controller.isUserAuthenticated(event, {}, logger, bankInterface)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(401);
  });
});
