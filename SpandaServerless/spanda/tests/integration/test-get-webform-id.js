/* MIGRATED */
'use strict';

/* eslint-env node, mocha */
const firefox = require('selenium-webdriver/firefox');
const {Builder, By, Key, until} = require('selenium-webdriver');
const chai = require('chai');
const expect = chai.expect;

const Users = require('../../lib/users');
const BankConnections = require('../../lib/bank-connections');

const controller = require('../../controllers/bank-controller');
const TestUtility = require('../test-utility');

describe('get webform id', function() {
  this.timeout(10000); // Selenium browser takes so much time.

  let logger
  let users
  let context
  let testUsername
  let testPassword
  let testValidEmail
  let testValidPhone

  expect(process.env.AZURE_TEST_USER_LOGIN).to.exist;
  expect(process.env.FinAPIClientId).to.exist;
  expect(process.env.FinAPIClientSecret).to.exist;

  let dummyInterfaces = TestUtility.CreateFinApitestInterfaces(process.env.FinAPIClientId,process.env.FinAPIClientSecret);
  let encryptions

  beforeEach(function() {
    testUsername = process.env.AZURE_TEST_USER_LOGIN;
    testPassword = process.env.AZURE_TEST_USER_LOGIN;
    testValidEmail = 'chapu@chapu.com'
    testValidPhone = '+66 6666'

    const winston = require('winston')
    const VoidTransport  = require('../void-transport')
    logger = winston.createLogger({ transports: [ new VoidTransport() ] })

    users = Users.NewInMemoryRepository()
    encryptions = require('../../lib/encryptions')

    context = {}
  })

  it('rejects requests with failing authentication', async () => {
    users.save(users.new(testUsername, testValidEmail, testValidPhone, false))

    const event = {
      'headers': {
        'Content-Type': 'application/json'
      },

      'body': JSON.stringify({ 'bankId': 277672 })
    }

    const result = await controller.getWebformId(event, context, logger, dummyInterfaces.bankInterface, users, encryptions)

    expect(result).to.be.an('object')
    expect(result.statusCode).to.equal(401)
  })

  it('rejects requests because user is not available', async () => {
    const authorization = await dummyInterfaces.authentication.getPasswordToken(dummyInterfaces.clientSecrets, testUsername, testPassword);

    const event = {
      'headers': {
        'Authorization': authorization.token_type + ' ' + authorization.access_token,
        'Content-Type': 'application/json'
      },

      'body': JSON.stringify({ 'bankId': 277672 })
    }

    const result = await controller.getWebformId(event, context, logger, dummyInterfaces.bankInterface, users, encryptions)

    expect(result).to.be.an('object')
    expect(result.statusCode).to.equal(401)
  })

  it('rejects requests because user save failed', async () => {
    const authorization = await dummyInterfaces.authentication.getPasswordToken(dummyInterfaces.clientSecrets, testUsername, testPassword);

    const failingUsers = {
      findById: async (id) => {
        return {
          'username': testUsername
        }
      },

      save: async (user) => {
        throw 'nada'
      }
    }

    const event = {
      'headers': {
        'Authorization': authorization.token_type + ' ' + authorization.access_token,
        'Content-Type': 'application/json'
      },

      'body': JSON.stringify({ 'bankId': 277672 })
    }

    const result = await controller.getWebformId(event, context, logger, dummyInterfaces.bankInterface, failingUsers, encryptions)

    expect(result).to.be.an('object')
    expect(result.statusCode).to.equal(500)
  })

  it('return webform location', async function() {
    users.save(users.new(testUsername, testValidEmail, testValidPhone, false))
    const authorization = await dummyInterfaces.authentication.getPasswordToken(dummyInterfaces.clientSecrets, testUsername, testPassword);

    const event = {
      'headers': {
        'Authorization': authorization.token_type + ' ' + authorization.access_token,
        'Content-Type': 'application/json'
      },

      'body': JSON.stringify({ 'bankId': 277672 })
    }

    const result = await controller.getWebformId(event, context, logger, dummyInterfaces.bankInterface, users, encryptions)

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(200);
    expect(JSON.parse(result.body).location).to.be.an('string');
    expect(JSON.parse(result.body).webFormAuth).to.be.an('string');
    console.log(JSON.parse(result.body).location)

    const screen = {
      width: 640,
      height: 480
    };
    let driver = await new Builder().forBrowser('firefox').setFirefoxOptions(new firefox.Options().headless().windowSize(screen))
    .build();
    try {
      await driver.get(JSON.parse(result.body).location);
      await driver.findElement(By.id('btnSubmit')).click();
      await driver.wait(until.elementsLocated(By.id('exitWithoutRedirect')), 1000);
    } finally {
      await driver.quit();
    }

    //expect(JSON.parse(result.body).location).to.equal('testlocation');
    expect(JSON.parse(result.body).webFormAuth.split("-").length).to.equal(2);

    let formId = JSON.parse(result.body).webFormAuth.split("-")[0];
    let encryptedAuth = JSON.parse(result.body).webFormAuth.split("-")[1];

    //expect(formId).to.equal('2934');
    expect(encryptedAuth).to.not.equal(event.headers.Authorization);

    // this test proves whether the right data is written to database
    let user = await users.findByWebForm(formId);
    //expect(formId).to.equal(user.activeWebFormId);
    expect(encryptions.DecryptText({ iv: user.activeWebFormAuth, encryptedData: encryptedAuth })).to.equal(event.headers.Authorization);
  })

})
