import { Handler } from "express";
import { authorization } from "../../../../middlewares/authentication";
import ratelimit from "../../../../middlewares/ratelimit";
import users, { UserRole } from "../../../../services/user";

export const get = [
  ratelimit(1, 1000),
  authorization(UserRole.GeneralManager),
  (async (req, res, next) => {
    const uid = req.params["authorized-uid"];
    console.log(`Accessing User List by ${uid}`);

    const search = (req.query.s ?? "") as string;
    const filter = (req.query.f ?? "") as string;
    const page = Number.parseInt((req.query.p ?? "1") as string);

    const results = await users.list(search, filter, page);

    res.status(200).send({
      payload: { results },
      message: "Request fullfilled"
    })
  }) as Handler
]