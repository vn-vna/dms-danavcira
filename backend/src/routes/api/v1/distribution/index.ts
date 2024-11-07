import { Handler } from "express";
import ratelimit from "../../../../middlewares/ratelimit";
import authorization from "../../../../middlewares/authentication";
import { UserRole } from "../../../../services/users";
import distributions from "../../../../services/distributions";

export const get = [
  authorization(UserRole.GeneralManager),
  (async (req, res, next) => {
    const uid = req.params["authorized-uid"];
    console.log(`Accessing User List by ${uid}`);

    const search = (req.query.s ?? "") as string;
    const filter = (req.query.f ?? "") as string;
    const page = Number.parseInt((req.query.p ?? "1") as string);

    const results = await distributions.search(search, filter, page);

    res.status(200).send({
      payload: { ...results },
      message: "Request fullfilled"
    })
  }) as Handler
]