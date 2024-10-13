import { Handler } from "express";
import crypto from "crypto"
import Lazy from "../utilities/lazy"

interface MiddlewareObject {
  count: number;
  lastUpdate: number;
}

class RateLimitMiddleware {
  private static INSTANCE = new Lazy<RateLimitMiddleware>(() => {
    return new RateLimitMiddleware();
  });

  public static getInstance() {
    return RateLimitMiddleware.INSTANCE.instance;
  }

  private mapping_: Map<String, MiddlewareObject>;

  constructor() {
    this.mapping_ = new Map<String, MiddlewareObject>;
  }

  public check(ip: string, url: string, limit: number, interval: number) {
    const hashed = crypto.hash("sha256", `${ip}::${url}`)
    const crrTime = Date.now();

    if (!this.mapping_.has(hashed)) {
      this.mapping_.set(hashed, {
        count: 0,
        lastUpdate: crrTime
      } as MiddlewareObject);
    }

    const counting = this.mapping_.get(hashed)!;
    counting.count++;

    if (crrTime - counting.lastUpdate < interval && counting.count > limit) {
      return false;
    }

    if (crrTime - counting.lastUpdate > interval) {
      this.mapping_.delete(hashed);
    }

    return true;
  }
}

function ratelimit(limit: number = 1000, interval: number = 1000) {
  return (async (req, res, next) => {
    const check = req.ip ? RateLimitMiddleware.getInstance().check(req.ip, req.baseUrl, limit, interval) : true;
    if (!check) {
      res.sendStatus(429)
      return;
    }

    next();
  }) as Handler
}

export default ratelimit;
