import CryptoJS from "crypto-js";
import config from "config"
import { Handler } from "express";

export function decryptRequest() {
  return ((req, res, next) => {
    if (!req.body) {
      next();
      return;
    }

    let data: string | undefined;

    if (typeof (req.body) === "string") {
      data = req.body;
    }

    if (typeof (req.body) === "object") {
      data = req.body.payload;
    }

    if (data) {
      const key = config.get("secret.aes.key") as string;
      req.body = JSON.parse(CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8));
    }

    next();
  }) as Handler;
}

export function encryptResponse() {
  return ((req, res, next) => {
    const defaultSend = res.send;
    const key = config.get("secret.aes.key") as string;

    res.send = (body) => {
      const data = JSON.stringify(body);
      const encrypted = CryptoJS.AES.encrypt(data, key).toString();
      return defaultSend.apply(res, [encrypted]);
    };

    next();
  }) as Handler
}
