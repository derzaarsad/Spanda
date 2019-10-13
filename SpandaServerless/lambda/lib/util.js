'use strict';

exports.CreateAuthHeader = credentials => {
  return credentials.token_type + " " + credentials.access_token;
};
