/* MIGRATED */
'use strict';
/* eslint-env node, mocha */

const encryptions = require('../../lib/encryptions.js');
const chai = require('chai');

const expect = chai.expect;

describe('encryptions', function() {

  it('encryption and decryption', async function() {

    let someString = '708578 64aaddc201e87f11425be34ce019833f9c175472a52c3d168f5a3231a7680df9';
    let encryptedText = encryptions.EncryptText(someString);
    let decryptedText = encryptions.DecryptText(encryptedText);

    expect(encryptedText).to.be.an('object');
    expect(encryptedText.iv).to.be.an('string');
    expect(encryptedText.encryptedData).to.be.an('string');
    expect(encryptedText).to.not.equal(someString);
    expect(decryptedText).to.equal(someString);
  })
});