'use strict'

const axios = require('axios')
const util = require('../lib/util')

const clientSecrets = require('../lib/client-secrets')
const authentication = require('../lib/authentication')
const bankInterface = require('../lib/bankInterface')

const args = process.argv
const clientId = args[2]
const clientSecret = args[3]
const blz = args[4]
const baseURL = 'https://sandbox.finapi.io'

const options = { timeout: 3000 }

const client = axios.create({
  baseURL: baseURL,
  timeout: options.timeout,
  headers: { 'Accept': 'application/json' },
});

const secrets = clientSecrets.Resolved(clientId, clientSecret)
const auth = authentication.Basic(client)

const finClient = bankInterface(client)

auth.getClientCredentialsToken(secrets)
  .then(credentials => util.CreateAuthHeader(credentials))
  .then(authorization => finClient.listBanksByBLZ(authorization, blz))
  .then(data => console.log(data))
