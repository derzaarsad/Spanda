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
      'headers': {
        'Username': 'chapu'
      }
    }

    const result = await controller.getAllowance(event, context, logger, finapi, users)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(403);
    expect(JSON.parse(result.body).message).to.include('unauthorized');
  })

  it('rejects a request with missing username', async function() {
    const finapi = {}

    const event = {
      'headers': {
        'Authorization': 'ok'
      }
    }

    const result = await controller.getAllowance(event, context, logger, finapi, users)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(400);
    expect(JSON.parse(result.body).message).to.include('no username');
  })

  it('rejects a request with missing user', async function() {
    const finapi = {
      userInfo: async () => {
        return { 'ok': true }
      }
    }

    const event = {
      'headers': {
        'Authorization': 'ok',
        'Username': 'chapu'
      }
    }

    const result = await controller.getAllowance(event, context, logger, finapi, users)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(404);
    expect(JSON.parse(result.body).message).to.include('user not found');
  })

  it('gets the user allowance', async function() {
    const user = users.new('chapu', 'chapu@mischung.net', '666', false)
    user.allowance = 666
    users.save(user)

    const finapi = {
      userInfo: async () => {
        return { 'ok': true }
      }
    }

    const event = {
      'headers': {
        'Authorization': 'ok',
        'Username': 'chapu'
      }
    }

    const result = await controller.getAllowance(event, context, logger, finapi, users)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(200);
    expect(JSON.parse(result.body).allowance).to.equal(666);
  })
})
