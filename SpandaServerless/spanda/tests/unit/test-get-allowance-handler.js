'use strict';

/* eslint-env node, mocha */
const chai = require('chai');
const expect = chai.expect;

const Users = require('../../lib/users');

const controller = require('../../controllers/bank-controller');

describe('get allowance handler', function() {
  let logger
  let users
  let context

  beforeEach(function() {
    const winston = require('winston')
    logger = winston.createLogger({ transports: [ new winston.transports.Console() ] })

    users = Users.NewInMemoryRepository()

    context = {}
  })

  it('rejects a request with missing authorization', async function() {
    const finapi = {}

    const event = {
      'headers': {}
    }

    const result = await controller.getAllowance(event, context, logger, finapi, users)

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
        'Authorization': 'ok'
      }
    }

    const result = await controller.getAllowance(event, context, logger, finapi, users)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(401);
    expect(JSON.parse(result.body).message).to.include('unauthorized');
  })

  it('rejects a request with missing user', async function() {
    const finapi = {
      userInfo: async () => {
        return { 'id': 'chapu' }
      }
    }

    const event = {
      'headers': {
        'Authorization': 'ok'
      }
    }

    const result = await controller.getAllowance(event, context, logger, finapi, users)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(500);
    expect(JSON.parse(result.body).message).to.include('error fetching allowance');
  })

  it('gets the user allowance', async function() {
    const user = users.new('chapu', 'chapu@mischung.net', '666', false)
    user.allowance = 666
    users.save(user)

    const finapi = {
      userInfo: async () => {
        return { 'id': 'chapu' }
      }
    }

    const event = {
      'headers': {
        'Authorization': 'ok'
      }
    }

    const result = await controller.getAllowance(event, context, logger, finapi, users)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(200);
    expect(JSON.parse(result.body).allowance).to.equal(666);
  })
})
