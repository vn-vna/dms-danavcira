import { Handler } from "express";
import ratelimit from "../../../../middlewares/ratelimit";
import authorization from "../../../../middlewares/authentication";
import { UserRole } from "../../../../services/users";
import warehouses from "../../../../services/warehouses";


export const get = [
  authorization(UserRole.GeneralManager),
  (async (req, res, next) => {
    const search = (req.query.s ?? "") as string;
    const filter = (req.query.f ?? "") as string;
    const page = Number.parseInt((req.query.p ?? "1") as string);

    const results = await warehouses.search(search, filter, page);

    res.status(200).send({
      payload: { ...results },
      message: "Request fullfilled"
    })
  }) as Handler
]

export const post = [
  ratelimit(1, 100),
  authorization(UserRole.GeneralManager),
  (async (req, res, next) => {
    const uid = req.params["authorized-uid"];
    console.log(`Creating Warehouse by ${uid}`);

    const warehouse = await warehouses.create({ ...req.body });

    res.status(200).send({
      payload: { warehouse },
      message: "Request fullfilled"
    })
  }) as Handler
]