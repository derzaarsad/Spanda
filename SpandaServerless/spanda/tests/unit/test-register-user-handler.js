'use strict';

/* eslint-env node, mocha */
const chai = require('chai');
const expect = chai.expect;
const forEach = require('mocha-each');

const ClientSecrets = require('../../lib/client-secrets');
const Users = require('../../lib/users');

const controller = require('../../controllers/authentication-controller');

describe('register user handler', function() {
  let logger
  let users
  let clientSecrets
  let authentications;
  let context
  let testUsername
  let testPassword
  let testValidEmail
  let testInvalidEmail
  let testValidPhone
  let testInvalidPhone

  expect(process.env.AZURE_TEST_USER_REGISTER).to.exist;
  expect(process.env.FinAPIClientId).to.exist;
  expect(process.env.FinAPIClientSecret).to.exist;

  let successfulAuthentication = {
    getClientCredentialsToken: async () => {
      return {
        'auth': true
      }
    }
  }
  authentications = [successfulAuthentication]

  beforeEach(function() {
    testUsername = process.env.AZURE_TEST_USER_REGISTER;
    testPassword = 'secret';
    testValidEmail = 'chapu@mischung.net';
    testInvalidEmail = 'chapu@chapu';
    testValidPhone = '+66 66 6666';
    testInvalidPhone = 'invalid';

    const winston = require('winston')
    logger = winston.createLogger({ transports: [ new winston.transports.Console() ] })

    clientSecrets = ClientSecrets.Resolved('client-id', 'client-secret')

    users = Users.NewInMemoryRepository()
    context = {}
  })

  forEach(authentications)
  .it('rejects a request with missing attributes', async (authentication) => {
    const user = { 'id': testUsername }

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

  forEach(authentications)
  .it('rejects a request with invalid email', async (authentication) => {
    const user = { 'id': testUsername, 'password': testPassword, 'email': testInvalidEmail, 'phone': testValidPhone, 'isAutoUpdateEnabled': true }

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

  forEach(authentications)
  .it('rejects a request with invalid phone', async (authentication) => {
    const user = { 'id': testUsername, 'password': testPassword, 'email': testValidEmail, 'phone': testInvalidPhone, 'isAutoUpdateEnabled': true }

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

  forEach(authentications)
  .it('rejects a request failing authorization', async (authentication) => {
    const user = { 'id': testUsername, 'password': testPassword, 'email': testValidEmail, 'phone': testValidPhone, 'isAutoUpdateEnabled': true }

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

  forEach(authentications)
  .it('rejects a request with with existing user', async (authentication) => {
    users.save(users.new(testUsername, testValidEmail, testValidPhone, false))

    const user = { 'id': testUsername, 'password': testPassword, 'email': testValidEmail, 'phone': testValidPhone, 'isAutoUpdateEnabled': true }
    const finapi = {}
    const event = {
      'headers': {},
      'body': JSON.stringify(user)
    }

    const result = await controller.registerUser(event, context, logger, clientSecrets, authentication, finapi, users)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(409);
  })

  forEach(authentications)
  .it('adds a new user to the repository', async (authentication) => {
    const user = { 'id': testUsername, 'password': testPassword, 'email': testValidEmail, 'phone': testValidPhone, 'isAutoUpdateEnabled': true }

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

    const newUser = await users.findById(testUsername)
    expect(newUser, 'expected the user to have been persisted').to.be.ok
    expect(newUser).to.be.an('object');
  })
})
