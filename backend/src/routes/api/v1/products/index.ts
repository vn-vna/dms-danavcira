import { Handler } from "express";
import authorization from "../../../../middlewares/authentication";
import ratelimit from "../../../../middlewares/ratelimit";
import { UserRole } from "../../../../services/users";
import products from "../../../../services/products";

export const get = [
  authorization(),
  (async (req, res, next) => {
    const search = (req.query.s ?? "") as string;
    const filter = (req.query.f ?? "") as string;
    const page = Number.parseInt((req.query.p ?? "1") as string);

    const result = await products.search(search, filter, page);

    res.status(200).send({
      payload: { ...result },
      message: "Request fullfilled"
    })
  }) as Handler
]

export const post = [
  ratelimit(1, 100),
  authorization(UserRole.GeneralManager),
  (async (req, res, next) => {
    const name = req.body.name as string;
    const price = Number.parseFloat(req.body.price as string);
    const unit = req.body.unit as string;
    const thumbnail = req.body.thumbnail as string;

    const product = await products.create(name, price, unit, thumbnail);

    res.status(200).send({
      payload: { product },
      message: "Product created"
    })
  }) as Handler
]
