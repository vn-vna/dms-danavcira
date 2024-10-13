import { Handler } from "express";

export default function tracing() {
  return ((req, res, next) => {
    const crrTime = new Date();
    console.log(`${crrTime.toISOString()} [${req.method} ${req.url}] {Body: ${JSON.stringify(req.body)}}`);
    next();
  }) as Handler
}