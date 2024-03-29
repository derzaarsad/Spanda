/* MIGRATED */
'use strict';
/* eslint-env node, mocha */

const lambdaUtil = require('../../lib/lambda-util.js');
const chai = require('chai');

const expect = chai.expect;

describe('lambda util', function() {
  it('matches upcase in hasAuthorization', async function() {
    const expected = "bearer 5325626"

    const headers = {
      "Authorization": expected
    };

    const result = lambdaUtil.hasAuthorization(headers)

    expect(result).to.equal(expected);
  });

  it('matches lowercase in hasAuthorization', async function() {
    const expected = "bearer 5325626"

    const headers = {
      "authorization": expected
    };

    const result = lambdaUtil.hasAuthorization(headers)

    expect(result).to.equal(expected);
  });

  it('returns falsy when header does not contain authorization in hasAuthorization', async function() {
    const headers = {
      "Accept-Language": "en-US,en;q=0.8",
    };

    const result = lambdaUtil.hasAuthorization(headers)

    expect(result).not.to.be.ok;
  });

  it('returns nothing when all properties given', async function() {
    const body = {
      'id': 'chapu',
      'email': 'chapu@mischung.net',
      'cred': 5000,
      'rad': true
    }

    expect(lambdaUtil.HasMissingProperty(body, ['id', 'email', 'cred', 'rad'])).not.to.be.ok
  })

  it('returns the first missing property', async function() {
    const body = {
      'id': 'chapu',
      'rad': true
    }

    expect(lambdaUtil.HasMissingProperty(body, ['id', 'email', 'cred', 'rad'])).to.equal('email')
  })
});

