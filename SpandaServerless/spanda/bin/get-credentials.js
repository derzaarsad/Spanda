'use strict'

const clientSecrets = require('../lib/client-secrets')
const authentication = require('../lib/authentication')

const args = process.argv
const clientId = args[2]
const clientSecret = args[3]

const options = { timeout: 3000 }

const client = axios.create({
  baseURL: 'https://sandbox.finapi.io',
  timeout: options.timeout,
  headers: { 'Accept': 'application/json' },
});

const secrets = clientSecrets.Resolved(clientId, clientSecret)
const auth = authentication.Basic(client)

auth.getClientCredentialsToken(secrets).then(credentials => console.log(credentials))
