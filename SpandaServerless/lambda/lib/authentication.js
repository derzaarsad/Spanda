'use strict'

const qs = require('querystring');
const axios = require('axios').default;

const Basic = (baseURL, clientSecrets) => {
  const webClient = axios.create({
    'baseURL': baseURL,
    'timeout': 1000,
    'headers': {'Accept': 'application/json'}
  });

  const authRequest = (secrets) => {
    const formData = {
      'grant_type': 'client_credentials',
      'client_id': secrets.clientId,
      'client_secret': secrets.clientSecret,
    }

    return qs.stringify(formData)
  }

  return {
    'getClientCredentials': async () => {
      return clientSecrets.getSecrets()
        .then((secrets) => webClient.post('oauth/token', authRequest(secrets)))
        .then(response => response.data);
    },
  }
}

exports.Basic = Basic
