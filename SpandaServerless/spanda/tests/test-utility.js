'use strict';

const axios = require('axios');
const Authentication = require('../lib/authentication');
const ClientSecrets = require('../lib/client-secrets');

exports.CreateAuthAndClientSecrets = (clientId,clientSecret) => {

  // Create Authentications
  let successfulAuthentication = {
    getClientCredentialsToken: async () => {
        return {
            'auth': true
        }
    },

    getPasswordToken: async () => {
        return {
            'access_token': "yyz"
        }
    }
  }

  let finApiAuthentication = Authentication.Basic(axios.create({
    baseURL: 'https://sandbox.finapi.io',
    timeout: 3000,
    headers: { 'Accept': 'application/json' },
  }));

  // Create ClientSecrets
  let dummyClientSecrets = ClientSecrets.Resolved('client-id', 'client-secret')
  let finApiClientSecrets = ClientSecrets.Resolved(clientId, clientSecret)

  // Package Authentications and ClientSecrets
  let authAndClientSecrets = [
    [successfulAuthentication,dummyClientSecrets],
    [finApiAuthentication,finApiClientSecrets]
  ];

  return authAndClientSecrets;
};