import { AesCrypto } from "../lib/aes-crypto";

test("decrypt a ciphertext encrypted by self", () => {
  const key = "8deec885781c421794ceda8af70a5e63";
  const crypto = new AesCrypto(key);

  const cipherText = crypto.encrypt("hello");

  expect(crypto.decrypt(cipherText)).toEqual("hello");
});

test("decrypt a ciphertext encrypted by finapi", async function() {
  const key = "8deec885781c421794ceda8af70a5e63";
  const crypto = new AesCrypto(key);

  const cipherText = "VzQvibakzi5ednt5RMMQYRJXVgL31NWk3E/sSi7PFbpIupcuW3Cgd2KWTxvqLNPt";
  expect(crypto.decrypt(cipherText)).toEqual("45b057dd-a036-491f-ab1c-fbb9a4c3dcb9");
});
