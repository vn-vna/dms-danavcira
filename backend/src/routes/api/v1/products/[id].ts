import { Handler } from "express";
import ratelimit from "../../../../middlewares/ratelimit";
import authorization from "../../../../middlewares/authentication";
import { UserRole } from "../../../../services/users";
import products from "../../../../services/products";

export const get = [
  authorization(UserRole.GeneralManager),
  (async (req, res, next) => {
    const uid = req.params["authorized-uid"];
    console.log(`Accessing User List by ${uid}`);

    const id = req.params["id"];

    const result = await products.getProductById(id);

    res.status(200).send({
      payload: { ...result },
      message: "Request fullfilled"
    })
  }) as Handler
]

export const put = [
  ratelimit(1, 100),
  authorization(UserRole.GeneralManager),
  (async (req, res, next) => {
    const id = req.params["id"];
    const name = req.body.name as string;
    const price = Number.parseFloat(req.body.price as string);
    const unit = req.body.unit as string;
    const thumbnail = req.body.thumbnail as string;

    await products.updateProduct(id, name, price, unit, thumbnail);

    res.status(200).send({
      payload: {},
      message: "Product updated"
    })
  }) as Handler
]

export const del = [
  ratelimit(1, 100),
  authorization(UserRole.GeneralManager),
  (async (req, res, next) => {
    const id = req.params["id"];

    await products.deleteProduct(id);

    res.status(200).send({
      payload: {},
      message: "Product deleted"
    })
  }) as Handler
]
