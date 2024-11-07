import { Handler } from "express";
import authorization from "../../../../middlewares/authentication";
import { UserRole } from "../../../../services/users";
import orders from "../../../../services/orders";

export const get = [
  authorization(UserRole.GeneralManager),
  (async (req, res, next) => {
    const results = await orders.getById(req.params.id);

    res.status(200).send({
      payload: { results },
      message: "Request fullfilled"
    })
  }) as Handler
]

export const put = [
  authorization(UserRole.GeneralManager),
  (async (req, res, next) => {
    const order_id = req.params.id;
    const items = req.body["items"];

    const order = await orders.update(order_id, { items });

    res.status(200).send({
      payload: { order },
      message: "Request fullfilled"
    })
  }) as Handler
]

export const del = [
  authorization(UserRole.GeneralManager),
  (async (req, res, next) => {
    await orders.delete(req.params.id);

    res.status(200).send({
      payload: { },
      message: "Request fullfilled"
    })
  }) as Handler
]