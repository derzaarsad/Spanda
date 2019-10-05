'use strict'

const SSM = require('aws-sdk/clients/ssm')

const clientSecrets = require('../lib/client-secrets')
const authentication = require('../lib/authentication')

const args = process.argv
const region = args[2]
const clientIdParam = args[3]
const clientSecretParam = args[4]

const ssm = new SSM({
  apiVersion: '2014-11-06',
  region: region,
})

const secrets = clientSecrets.FromSSM(ssm, clientIdParam, clientSecretParam)
const auth = authentication.Basic('https://sandbox.finapi.io/', secrets)

auth.getClientCredentials().then(credentials => console.log(credentials))
