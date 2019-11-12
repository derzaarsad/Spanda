'use strict';

/* eslint-env node, mocha */
const chai = require('chai');
const expect = chai.expect;

const ClientSecrets = require('../../lib/client-secrets');
const Users = require('../../lib/users');

const controller = require('../../controllers/authentication-controller');

describe('register user handler', function() {
  let logger
  let users
  let clientSecrets
  let authentication
  let context

  beforeEach(function() {
    const winston = require('winston')
    const VoidTransport  = require('./void-transport')
    logger = winston.createLogger({ transports: [ new VoidTransport() ] })

    clientSecrets = ClientSecrets.Resolved('client-id', 'client-secret')
    authentication = {
      getClientCredentialsToken: async () => {
        return {
          'auth': true
        }
      }
    }

    users = Users.NewInMemoryRepository()
    context = {}
  })

  it('rejects a request with missing attributes', async function() {
    const user = { 'id': 'chapu' }

    const finapi = {}

    const event = {
      'headers': {},
      'body': JSON.stringify(user)
    }

    const result = await controller.registerUser(event, context, logger, clientSecrets, authentication, finapi, users)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(400);
    expect(JSON.parse(result.body).message).to.include('missing user property');
  })

  it('rejects a request with invalid email', async function() {
    const user = { 'id': 'chapu', 'password': 'secret', 'email': 'chapu@chapu', 'phone': '+66 66 6666', 'isAutoUpdateEnabled': true }

    const finapi = {}

    const event = {
      'headers': {},
      'body': JSON.stringify(user)
    }

    const result = await controller.registerUser(event, context, logger, clientSecrets, authentication, finapi, users)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(400);
    expect(JSON.parse(result.body).message).to.include('invalid email');
  })

  it('rejects a request with invalid phone', async function() {
    const user = { 'id': 'chapu', 'password': 'secret', 'email': 'chapu@chapucero.com', 'phone': 'invalid', 'isAutoUpdateEnabled': true }

    const finapi = {}

    const event = {
      'headers': {},
      'body': JSON.stringify(user)
    }

    const result = await controller.registerUser(event, context, logger, clientSecrets, authentication, finapi, users)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(400);
    expect(JSON.parse(result.body).message).to.include('invalid phone');
  })

  it('rejects a request failing authorization', async function() {
    const user = { 'id': 'chapu', 'password': 'secret', 'email': 'chapu@mischung.net', 'phone': '+66 66 6666', 'isAutoUpdateEnabled': true }

    const failingAuthentication = {
      getClientCredentialsToken: async () => {
        throw 'nada'
      }
    }

    const finapi = {}

    const event = {
      'headers': {},
      'body': JSON.stringify(user)
    }

    const result = await controller.registerUser(event, context, logger, clientSecrets, failingAuthentication, finapi, users)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(401);
  })

  it('rejects a request with with existing user', async function() {
    users.save(users.new('chapu', 'chapu@mischung.net', '666', false))

    const user = { 'id': 'chapu', 'password': 'secret', 'email': 'chapu@mischung.net', 'phone': '+66 66 6666', 'isAutoUpdateEnabled': true }
    const finapi = {}
    const event = {
      'headers': {},
      'body': JSON.stringify(user)
    }

    const result = await controller.registerUser(event, context, logger, clientSecrets, authentication, finapi, users)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(409);
  })

  it('adds a new user to the repository', async function() {
    const user = { 'id': 'chapu', 'password': 'secret', 'email': 'chapu@mischung.net', 'phone': '+66 66 6666', 'isAutoUpdateEnabled': true }

    const finapi = {
      registerUser: async() => {
        return 'ok'
      }
    }

    const event = {
      'headers': {},
      'body': JSON.stringify(user)
    }

    const result = await controller.registerUser(event, context, logger, clientSecrets, authentication, finapi, users)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(201, 'expected status code created');

    const newUser = await users.findById('chapu')
    expect(newUser, 'expected the user to have been persisted').to.be.ok
    expect(newUser).to.be.an('object');
  })
})
