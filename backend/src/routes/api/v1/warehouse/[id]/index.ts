import { Handler } from "express";
import ratelimit from "../../../../../middlewares/ratelimit";
import authorization from "../../../../../middlewares/authentication";
import { UserRole } from "../../../../../services/users";
import warehouses from "../../../../../services/warehouses";

export const get = [
  authorization(),
  (async (req, res, next) => {
    const warehouse = await warehouses.getWarehouseById(req.params.id);

    res.status(200).send({
      payload: { warehouse },
      message: "Request fullfilled"
    })
  }) as Handler
]

export const put = [
  authorization(),
  (async (req, res, next) => {

    const warehouse = await warehouses.updateWarehouseById(req.params.id, { ...req.body });

    res.status(200).send({
      payload: { warehouse },
      message: "Request fullfilled"
    })
  }) as Handler
]

export const del = [
  authorization(),
  (async (req, res, next) => {
    await warehouses.deleteWarehouse(req.params.id);

    res.status(200).send({
      payload: {},
      message: "Request fullfilled"
    })
  }) as Handler
]