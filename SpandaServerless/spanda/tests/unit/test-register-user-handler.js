/* MIGRATED */
'use strict';

/* eslint-env node, mocha */
const chai = require('chai');
const expect = chai.expect;
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

  let dummyInterfaces = TestUtility.CreateUnittestInterfaces();

  beforeEach(function() {
    testUsername = 'chapu';
    testPassword = 'secret';
    testValidEmail = 'chapu@mischung.net';
    testInvalidEmail = 'chapu@chapu';
    testValidPhone = '+66 66 6666';
    testInvalidPhone = 'invalid';

    const winston = require('winston')
    const VoidTransport  = require('../void-transport')
    logger = winston.createLogger({ transports: [ new VoidTransport() ] })

    users = Users.NewInMemoryRepository()
    context = {}
  })

  it('rejects a request with missing attributes', async () => {
    const user = { 'id': testUsername }

    const event = {
      'headers': {},
      'body': JSON.stringify(user)
    }

    const result = await controller.registerUser(event, context, logger, dummyInterfaces.clientSecrets, dummyInterfaces.authentication, dummyInterfaces.bankInterface, users)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(400);
    expect(JSON.parse(result.body).message).to.include('missing user property');
  })

  it('rejects a request with invalid email', async () => {
    const user = { 'id': testUsername, 'password': testPassword, 'email': testInvalidEmail, 'phone': testValidPhone, 'isAutoUpdateEnabled': true }

    const event = {
      'headers': {},
      'body': JSON.stringify(user)
    }

    const result = await controller.registerUser(event, context, logger, dummyInterfaces.clientSecrets, dummyInterfaces.authentication, dummyInterfaces.bankInterface, users)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(400);
    expect(JSON.parse(result.body).message).to.include('invalid email');
  })

  it('rejects a request with invalid phone', async () => {
    const user = { 'id': testUsername, 'password': testPassword, 'email': testValidEmail, 'phone': testInvalidPhone, 'isAutoUpdateEnabled': true }

    const event = {
      'headers': {},
      'body': JSON.stringify(user)
    }

    const result = await controller.registerUser(event, context, logger, dummyInterfaces.clientSecrets, dummyInterfaces.authentication, dummyInterfaces.bankInterface, users)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(400);
    expect(JSON.parse(result.body).message).to.include('invalid phone');
  })

  it('rejects a request failing authorization', async () => {
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

    const result = await controller.registerUser(event, context, logger, dummyInterfaces.clientSecrets, failingAuthentication, dummyInterfaces.bankInterface, users)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(401);
  })

  it('rejects a request with with existing user', async () => {
    users.save(users.new(testUsername, testValidEmail, testValidPhone, false))

    const user = { 'id': testUsername, 'password': testPassword, 'email': testValidEmail, 'phone': testValidPhone, 'isAutoUpdateEnabled': true }
    const event = {
      'headers': {},
      'body': JSON.stringify(user)
    }

    const result = await controller.registerUser(event, context, logger, dummyInterfaces.clientSecrets, dummyInterfaces.authentication, dummyInterfaces.bankInterface, users)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(409);
  })

  it('adds a new user to the repository', async () => {
    const user = { 'id': testUsername, 'password': testPassword, 'email': testValidEmail, 'phone': testValidPhone, 'isAutoUpdateEnabled': true }

    const event = {
      'headers': {},
      'body': JSON.stringify(user)
    }

    const result = await controller.registerUser(event, context, logger, dummyInterfaces.clientSecrets, dummyInterfaces.authentication, dummyInterfaces.bankInterface, users)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(201, 'expected status code created');

    const newUser = await users.findById(testUsername)
    expect(newUser, 'expected the user to have been persisted').to.be.ok
    expect(newUser).to.be.an('object');
  })
})
