'use strict';
/* eslint-env node, mocha */

const Decryptor = require('../../lib/region_specific/de/finapi-decryptor.js');
const chai = require('chai');

const expect = chai.expect;

describe('finapi crypto', function() {
  it('decrypts a ciphertext encrypted by self', async function() {
    const key = '8deec885781c421794ceda8af70a5e63';
    const decryptor = Decryptor.new(key)

    const cipherText = decryptor.encrypt('hello');

    expect(decryptor.decrypt(cipherText)).to.equal('hello');
  })
});
