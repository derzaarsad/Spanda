"use strict";
/* eslint-env node, mocha */

import { CallbackCrypto } from "../../src/crypto";
import chai from "chai";

const expect = chai.expect;

describe("encryptions", function() {
  it("encryption and decryption", async function() {
    const encryptions = new CallbackCrypto();
    let someString = "708578 64aaddc201e87f11425be34ce019833f9c175472a52c3d168f5a3231a7680df9";
    let encryptedText = encryptions.EncryptText(someString);
    let decryptedText = encryptions.DecryptText(encryptedText);

    expect(encryptedText).to.be.an("object");
    expect(encryptedText.iv).to.be.an("string");
    expect(encryptedText.cipherText).to.be.an("string");
    expect(encryptedText).to.not.equal(someString);
    expect(decryptedText).to.equal(someString);
  });
});
