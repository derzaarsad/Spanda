export default interface Crypto {
  encrypt(plainText: string): string;
  decrypt(cipherText: string): string;
}
