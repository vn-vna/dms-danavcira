import { Handler } from "express";
import authorization from "../../../../middlewares/authentication";
import ratelimit from "../../../../middlewares/ratelimit";
import users, { UserRole } from "../../../../services/users";

export const get = [
  (async (req, res, next) => {
    const uid = req.params["authorized-uid"];
    console.log(`Accessing User List by ${uid}`);

    const search = (req.query.s ?? "") as string;
    const filter = (req.query.f ?? "") as string;
    const page = Number.parseInt((req.query.p ?? "1") as string);

    const results = await users.search(search, filter, page);

    res.status(200).send({
      payload: { results },
      message: "Request fullfilled"
    })
  }) as Handler
]

export const post = [
  (async (req, res, next) => {
    const uid = req.params["authorized-uid"];
    console.log(`Creating User by ${uid}`);

    const data = req.body;
    const user = await users.createUser(data);

    res.status(200).send({
      payload: { user },
      message: "Request fullfilled"
    });
  }) as Handler
]