import CryptoJS from "crypto-js";
import { nanoid } from "nanoid";

const frag = (str, fragmentSize = 8) => {
  const arr = [];
  let keyIndex = 0;
  for (let i = 0; i < str.length; i += fragmentSize) {
    const fragment = str.slice(i, i + fragmentSize);
    const key = nanoid(fragmentSize);
    if (i % 3 === 0) {
      arr.push({ [fragment]: { [keyIndex++]: key } });
    } else {
      arr.push({ [key]: { [keyIndex++]: fragment } });
    }
  }
  return arr;
};

const defrag = (arr) => {
  let str = "";
  for (let i = 0; i < arr.length; i++) {
    const obj = arr[i];
    for (const [key, value] of Object.entries(obj)) {
      if (i % 3 === 0) {
        str += key;
      } else {
        const sortedKeys = Object.keys(value).sort((a, b) => a - b);
        for (const keyIndex of sortedKeys) {
          str += value[keyIndex];
        }
      }
    }
  }
  return str;
};

const resAes = process.env.REACT_APP_RESPONSE_AES_SECRET;

const encryptRequest = (data = {}) => {
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), resAes);
  const cipherText = encrypted.toString();
  return JSON.stringify({ payload: frag(cipherText) });
};

const decryptResponse = (data = {}) => {
  const mergedString = defrag(data?.cpr_ctx);
  const decrypted = CryptoJS.AES.decrypt(mergedString, resAes);
  const parsed = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  return parsed;
};

export { decryptResponse, encryptRequest };
