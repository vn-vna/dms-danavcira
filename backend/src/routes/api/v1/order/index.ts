import { Handler } from "express";
import authorization from "../../../../middlewares/authentication";
import { UserRole } from "../../../../services/users";
import orders from "../../../../services/orders";
import tasks, { TaskReport } from "../../../../services/tasks";

export const get = [
  authorization(),
  (async (req, res, next) => {
    const uid = req.params["authorized-uid"];
    console.log(`Accessing User List by ${uid}`);

    const search = (req.query.s ?? "") as string;
    const filter = (req.query.f ?? "") as string;
    const page = Number.parseInt((req.query.p ?? "1") as string);
    const from = (req.query.from ?? "2000-01-01T00:00:00.000Z") as string;
    const to = (req.query.to ?? new Date().toISOString()) as string;

    const results = await orders.search(search, filter, page, from, to);

    res.status(200).send({
      payload: { ...results },
      message: "Request fullfilled"
    })
  }) as Handler
]

export const post = [
  authorization(),
  (async (req, res, next) => {
    const order = await orders.create({
      ...req.body,
      created_date: new Date().toISOString(),
      completed: false,
    });

    if (req.body.task_id)
    {
      await tasks.reportTask(req.body.task_id, {
        type: "order",
        order_id: order._id,
        reported_date: new Date().toISOString(),
      } as TaskReport);
    }

    res.status(200).send({
      payload: { order },
      message: "Request fullfilled"
    })
  }) as Handler
]