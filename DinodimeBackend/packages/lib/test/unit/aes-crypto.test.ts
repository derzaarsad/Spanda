import { AesCrypto } from "../../src/crypto";
import chai from "chai";
const expect = chai.expect;

describe("unit: AES-based crypto", function() {
  it("decrypts a ciphertext encrypted by self", async function() {
    const key = "8deec885781c421794ceda8af70a5e63";
    const crypto = new AesCrypto(key);

    const cipherText = "VzQvibakzi5ednt5RMMQYRJXVgL31NWk3E/sSi7PFbpIupcuW3Cgd2KWTxvqLNPt";
    expect(crypto.decrypt(cipherText)).to.equal("45b057dd-a036-491f-ab1c-fbb9a4c3dcb9");
  });

  it("decrypts a ciphertext encrypted by finapi", async function() {
    const key = "8deec885781c421794ceda8af70a5e63";
    const crypto = new AesCrypto(key);

    const cipherText = "VzQvibakzi5ednt5RMMQYRJXVgL31NWk3E/sSi7PFbpIupcuW3Cgd2KWTxvqLNPt";
    expect(crypto.decrypt(cipherText)).to.equal("45b057dd-a036-491f-ab1c-fbb9a4c3dcb9");
  });
});
