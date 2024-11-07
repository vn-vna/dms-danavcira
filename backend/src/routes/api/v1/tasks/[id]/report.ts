import { Handler } from "express";
import ratelimit from "../../../../../middlewares/ratelimit";
import authorization from "../../../../../middlewares/authentication";
import { UserRole } from "../../../../../services/users";
import tasks from "../../../../../services/tasks";

export const put = [
  ratelimit(1, 100),
  authorization(UserRole.GeneralManager),
  (async (req, res, next) => {
    const task_id = req.params.id;
    const report = req.body["report"];

    const task = await tasks.reportTask(task_id, report);

    res.status(200).send({
      payload: { },
      message: "Request fullfilled"
    })
  }) as Handler
]