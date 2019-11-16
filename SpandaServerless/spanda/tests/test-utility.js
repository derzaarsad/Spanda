'use strict';

const axios = require('axios');
const Authentication = require('../lib/authentication');
const ClientSecrets = require('../lib/client-secrets');

exports.CreateAuthAndClientSecrets = (clientId,clientSecret) => {

  // Create Authentications
  let successfulAuthentication = {
    getClientCredentialsToken: async () => {
        return {
            'access_token': "yyz",
            'token_type': "bearer"
        }
    },

    getPasswordToken: async () => {
        return {
            'access_token': "yyz",
            'token_type': "bearer"
        }
    }
  }

  const httpClient = axios.create({
    baseURL: 'https://sandbox.finapi.io',
    timeout: 3000,
    headers: { 'Accept': 'application/json' },
  });

  let finApiAuthentication = Authentication.Basic(httpClient);

  // Create ClientSecrets
  let dummyClientSecrets = ClientSecrets.Resolved('client-id', 'client-secret')
  let finApiClientSecrets = ClientSecrets.Resolved(clientId, clientSecret)

  // Create bank interface
  let dummyBankInterface = {
    registerUser: async (authorization, user) => {
        return {}
      }
  };
  let finapiBankInterface = require('../lib/bankInterface')(httpClient);

  // Package Authentications and ClientSecrets
  let authAndClientSecrets = [
    [successfulAuthentication,dummyClientSecrets,dummyBankInterface],
    [finApiAuthentication,finApiClientSecrets,finapiBankInterface]
  ];

  return authAndClientSecrets;
};