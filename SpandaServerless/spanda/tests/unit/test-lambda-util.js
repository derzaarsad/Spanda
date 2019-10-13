'use strict';
/* eslint-env node, mocha */

const lambdaUtil = require('../../lib/lambda-util.js');
const chai = require('chai');

const expect = chai.expect;

describe('Tests hasAuthorization', function() {
  it('matches upcase', async function() {
    const expected = "bearer 5325626"

    const headers = {
      "Authorization": expected
    };

    const result = lambdaUtil.hasAuthorization(headers)

    expect(result).to.equal(expected);
  });

  it('matches lowercase', async function() {
    const expected = "bearer 5325626"

    const headers = {
      "authorization": expected
    };

    const result = lambdaUtil.hasAuthorization(headers)

    expect(result).to.equal(expected);
  });

  it('return falsy when header does not contain authorization', async function() {
    const headers = {
      "Accept-Language": "en-US,en;q=0.8",
    };

    const result = lambdaUtil.hasAuthorization(headers)

    expect(result).not.to.be.ok;
  });
});
