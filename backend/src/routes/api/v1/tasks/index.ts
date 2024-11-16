import { Handler } from "express";
import ratelimit from "../../../../middlewares/ratelimit";
import authorization from "../../../../middlewares/authentication";
import { UserRole } from "../../../../services/users";
import tasks from "../../../../services/tasks";

export const get = [
  authorization(),
  (async (req, res, next) => {
    const uid = req.params["authorized-uid"];
    console.log(`Accessing User List by ${uid}`);

    const search = (req.query.s ?? "") as string;
    const filter = (req.query.f ?? "") as string;
    const page = Number.parseInt((req.query.p ?? "1") as string);

    const results = await tasks.search(search, filter, page);

    res.status(200).send({
      payload: { ...results },
      message: "Request fullfilled"
    })
  }) as Handler
]

export const post = [
  ratelimit(1, 100),
  authorization(),
  (async (req, res, next) => {
    const uid = req.body["user_id"];

    const task = await tasks.create(uid, req.body);

    res.status(200).send({
      payload: { task },
      message: "Request fullfilled"
    })
  }) as Handler
]

