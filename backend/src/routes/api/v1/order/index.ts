import { Handler } from "express";
import authorization from "../../../../middlewares/authentication";
import { UserRole } from "../../../../services/users";
import orders from "../../../../services/orders";

export const get = [
  authorization(UserRole.GeneralManager),
  (async (req, res, next) => {
    const uid = req.params["authorized-uid"];
    console.log(`Accessing User List by ${uid}`);

    const search = (req.query.s ?? "") as string;
    const filter = (req.query.f ?? "") as string;
    const page = Number.parseInt((req.query.p ?? "1") as string);

    const results = await orders.search(search, filter, page);

    res.status(200).send({
      payload: { ...results },
      message: "Request fullfilled"
    })
  }) as Handler
]

export const post = [
  authorization(UserRole.GeneralManager),
  (async (req, res, next) => {
    const uid = req.body["uid"];
    const items = req.body["items"];

    const order = await orders.create(uid, items);

    res.status(200).send({
      payload: { order },
      message: "Request fullfilled"
    })
  }) as Handler
]