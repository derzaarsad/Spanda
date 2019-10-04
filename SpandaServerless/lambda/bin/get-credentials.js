'use strict'

const clientSecrets = require('../lib/client-secrets')
const authentication = require('../lib/authentication')

const args = process.argv
const clientId = args[2]
const clientSecret = args[3]

const secrets = clientSecrets.Resolved(clientId, clientSecret)
const auth = authentication.Basic('https://sandbox.finapi.io/', secrets)

auth.getClientCredentials().then(credentials => console.log(credentials))
