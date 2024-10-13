import { Handler } from "express"
import ratelimit from "../middlewares/ratelimit"


export const get = [
  ratelimit(),
  (async (req, res, next) => {
    res.send(
      {
        hello: "ok"
      }
    )
  }) as Handler
]