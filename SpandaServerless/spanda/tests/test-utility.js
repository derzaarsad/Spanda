'use strict';

const axios = require('axios');
const Authentication = require('../lib/authentication');
const ClientSecrets = require('../lib/client-secrets');

exports.CreateUnittestInterfaces = () => {

  // Create Authentications
  let authentication = {
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

  // Create ClientSecrets
  let clientSecrets = ClientSecrets.Resolved('client-id', 'client-secret')

  // Create bank interface
  let bankInterface = {
    userInfo: async (authorization) => {
      return {
        'id': 'chapu'
      }
    },

    registerUser: async (authorization, user) => {
      return {}
    },
    
    importConnection: async (authorization, bankId) => {
      return {
        // example from 
        'location': 'testlocation',
        'formId': '2934'
      }
    }
  };

  return {
    authentication,
    clientSecrets,
    bankInterface
  };
};

exports.CreateFinApitestInterfaces = (clientId,clientSecret) => {

  // Create Authentications
  const httpClient = axios.create({
    baseURL: 'https://sandbox.finapi.io',
    timeout: 3000,
    headers: { 'Accept': 'application/json' },
  });

  let authentication = Authentication.Basic(httpClient);

  // Create ClientSecrets
  let clientSecrets = ClientSecrets.Resolved(clientId, clientSecret)

  // Create bank interface
  let bankInterface = require('../lib/bankInterface')(httpClient);

  return {
    authentication,
    clientSecrets,
    bankInterface
  };
};