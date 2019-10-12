'use strict'

exports.authorizationHeader = credentials => {
  return credentials.token_type + " " + credentials.access_token
}
