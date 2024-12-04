import { Handler } from "express";

import authorization from "../../../../middlewares/authentication";
import tasks from "../../../../services/tasks";
import users from "../../../../services/users";
import orders from "../../../../services/orders";

export const get = [
  authorization(),
  (async (req, res, next) => {
    const userid = req.query.uid as string | undefined;
    const taskid = req.query.tid as string | undefined;
    const customerid = req.query.cid as string | undefined;
    const branchid = req.query.bid as string | undefined;

    const results = await tasks.getTaskById(req.params.id);

    res.status(200).send({
      payload: { ...results },
      message: "Request fullfilled"
    })
  }) as Handler
]