'use strict'

const axios = require('axios')
const util = require('../lib/util')

const clientSecrets = require('../lib/client-secrets')
const authentication = require('../lib/authentication')
const finAPI = require('../lib/finapi')

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

const finClient = finAPI.NewClient(client)

auth.getClientCredentialsToken(secrets)
  .then(credentials => util.CreateAuthHeader(credentials))
  .then(authorization => finClient.listBanksByBLZ(authorization, blz))
  .then(data => console.log(data))
