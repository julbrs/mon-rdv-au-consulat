import { Crypto } from "@peculiar/webcrypto";

const crypto = new Crypto();

/**
 * @param   {string} plaintext
 * @param   {string} password
 * @returns {Promise<string>}
 */
export async function aesGcmEncrypt(plaintext: string, password: string) {
  // encode password as UTF-8
  const pwUtf8 = Buffer.from(password, "utf-8");
  // hash the password
  const pwHash = await crypto.subtle.digest("SHA-256", pwUtf8);
  // get 96-bit random iv
  const iv = crypto.getRandomValues(new Uint8Array(12));
  // iv as utf-8 string
  const ivStr = Array.from(iv)
    .map((b) => String.fromCharCode(b))
    .join("");
  // specify algorithm to use
  const alg = { name: "AES-GCM", iv };
  // generate key from pw
  const key = await crypto.subtle.importKey("raw", pwHash, alg, false, [
    "encrypt",
  ]);
  // encode plaintext as UTF-8
  const ptUint8 = Buffer.from(plaintext, "utf-8");
  // encrypt plaintext using key
  const ctBuffer = await crypto.subtle.encrypt(alg, key, ptUint8);
  // ciphertext as byte array
  const ctArray = Array.from(new Uint8Array(ctBuffer));
  // ciphertext as string
  const ctStr = ctArray.map((byte) => String.fromCharCode(byte)).join("");
  // iv+ciphertext base64-encoded
  return Buffer.from(ivStr + ctStr).toString("base64"); // btoa(ivStr + ctStr);
}
