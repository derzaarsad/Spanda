'use strict';

/* eslint-env node, mocha */
const chai = require('chai');
const expect = chai.expect;
const forEach = require('mocha-each');
const controller = require('../../controllers/authentication-controller');
const TestUtility = require('../test-utility');

const Users = require('../../lib/users');

describe('register user handler', function() {
  let logger
  let users
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

  let authAndClientSecrets = TestUtility.CreateAuthAndClientSecrets(process.env.FinAPIClientId,process.env.FinAPIClientSecret)

  beforeEach(function() {
    testUsername = process.env.AZURE_TEST_USER_REGISTER;
    testPassword = 'secret';
    testValidEmail = 'chapu@mischung.net';
    testInvalidEmail = 'chapu@chapu';
    testValidPhone = '+66 66 6666';
    testInvalidPhone = 'invalid';

    const winston = require('winston')
    logger = winston.createLogger({ transports: [ new winston.transports.Console() ] })

    users = Users.NewInMemoryRepository()
    context = {}
  })

  forEach(authAndClientSecrets)
  .it('rejects a request with missing attributes', async (authentication,clientSecrets,bankInterface) => {
    const user = { 'id': testUsername }

    const event = {
      'headers': {},
      'body': JSON.stringify(user)
    }

    const result = await controller.registerUser(event, context, logger, clientSecrets, authentication, bankInterface, users)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(400);
    expect(JSON.parse(result.body).message).to.include('missing user property');
  })

  forEach(authAndClientSecrets)
  .it('rejects a request with invalid email', async (authentication,clientSecrets,bankInterface) => {
    const user = { 'id': testUsername, 'password': testPassword, 'email': testInvalidEmail, 'phone': testValidPhone, 'isAutoUpdateEnabled': true }

    const event = {
      'headers': {},
      'body': JSON.stringify(user)
    }

    const result = await controller.registerUser(event, context, logger, clientSecrets, authentication, bankInterface, users)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(400);
    expect(JSON.parse(result.body).message).to.include('invalid email');
  })

  forEach(authAndClientSecrets)
  .it('rejects a request with invalid phone', async (authentication,clientSecrets,bankInterface) => {
    const user = { 'id': testUsername, 'password': testPassword, 'email': testValidEmail, 'phone': testInvalidPhone, 'isAutoUpdateEnabled': true }

    const event = {
      'headers': {},
      'body': JSON.stringify(user)
    }

    const result = await controller.registerUser(event, context, logger, clientSecrets, authentication, bankInterface, users)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(400);
    expect(JSON.parse(result.body).message).to.include('invalid phone');
  })

  forEach(authAndClientSecrets)
  .it('rejects a request failing authorization', async (authentication,clientSecrets,bankInterface) => {
    const user = { 'id': testUsername, 'password': testPassword, 'email': testValidEmail, 'phone': testValidPhone, 'isAutoUpdateEnabled': true }

    const failingAuthentication = {
      getClientCredentialsToken: async () => {
        throw 'nada'
      }
    }

    const event = {
      'headers': {},
      'body': JSON.stringify(user)
    }

    const result = await controller.registerUser(event, context, logger, clientSecrets, failingAuthentication, bankInterface, users)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(401);
  })

  forEach(authAndClientSecrets)
  .it('rejects a request with with existing user', async (authentication,clientSecrets,bankInterface) => {
    users.save(users.new(testUsername, testValidEmail, testValidPhone, false))

    const user = { 'id': testUsername, 'password': testPassword, 'email': testValidEmail, 'phone': testValidPhone, 'isAutoUpdateEnabled': true }
    const event = {
      'headers': {},
      'body': JSON.stringify(user)
    }

    const result = await controller.registerUser(event, context, logger, clientSecrets, authentication, bankInterface, users)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(409);
  })

  forEach(authAndClientSecrets)
  .it('adds a new user to the repository', async (authentication,clientSecrets,bankInterface) => {
    const user = { 'id': testUsername, 'password': testPassword, 'email': testValidEmail, 'phone': testValidPhone, 'isAutoUpdateEnabled': true }

    const event = {
      'headers': {},
      'body': JSON.stringify(user)
    }

    const result = await controller.registerUser(event, context, logger, clientSecrets, authentication, bankInterface, users)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(201, 'expected status code created');

    const newUser = await users.findById(testUsername)
    expect(newUser, 'expected the user to have been persisted').to.be.ok
    expect(newUser).to.be.an('object');
  })
})
