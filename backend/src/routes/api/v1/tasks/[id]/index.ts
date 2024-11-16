import { Handler } from "express";
import ratelimit from "../../../../../middlewares/ratelimit";
import authorization from "../../../../../middlewares/authentication";
import { UserRole } from "../../../../../services/users";
import tasks from "../../../../../services/tasks";

export const get = [
  authorization(),
  (async (req, res, next) => {
    const results = await tasks.getTaskById(req.params.id);

    res.status(200).send({
      payload: { ...results },
      message: "Request fullfilled"
    })
  }) as Handler
]

export const put = [
  ratelimit(1, 100),
  authorization(),
  (async (req, res, next) => {
    const user_id = req.body["uid"];
    const address = req.body["address"];
    const long = req.body["long"];
    const lat = req.body["lat"];

    const task = await tasks.updateTask(req.params.id, {  user_id, address, long, lat });

    res.status(200).send({
      payload: { task },
      message: "Request fullfilled"
    })
  }) as Handler
]

export const del = [
  ratelimit(1, 100),
  authorization(),
  (async (req, res, next) => {
    await tasks.deleteTask(req.params.id);

    res.status(200).send({
      payload: { },
      message: "Request fullfilled"
    })
  }) as Handler
]