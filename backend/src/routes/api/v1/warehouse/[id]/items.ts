import { Handler } from "express";
import ratelimit from "../../../../../middlewares/ratelimit";
import authorization from "../../../../../middlewares/authentication";
import { UserRole } from "../../../../../services/users";
import warehouses from "../../../../../services/warehouses";

export const get = [
  authorization(UserRole.GeneralManager),
  (async (req, res, next) => {
    const warehouse = await warehouses.getWarehouseById(req.params.id);

    res.status(200).send({
      payload: { warehouse },
      message: "Request fullfilled"
    })
  }) as Handler
]

export const put = [
  ratelimit(1, 100),
  authorization(UserRole.GeneralManager),
  (async (req, res, next) => {
    const wid = req.params.id;
    const id = req.body["id"];
    const name = req.body["name"];
    const quantity = req.body["quantity"];

    const warehouse = await warehouses.setWarehouseItem(wid, id, quantity);

    res.status(200).send({
      payload: { warehouse },
      message: "Request fullfilled"
    })
  }) as Handler
]