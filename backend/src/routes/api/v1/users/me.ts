import { Handler } from "express";
import authorization from "../../../../middlewares/authentication";
import ratelimit from "../../../../middlewares/ratelimit";
import users, { UserRole } from "../../../../services/users";
import Exception from "../../../../exception";

export const get = [
  authorization(),
  (async (req, res, next) => {
    const accessUid = req.params["authorized-uid"] as string;
    const accessRole = Number.parseInt(req.params["authorized-role"]) as UserRole;

    const user = await users.getUserById(accessUid);

    if (!user) {
      res.status(404).send({
        message: "Cannot find user"
      });
      return;
    }

    res.status(200).send({
      payload: { result: user },
      message: "Request fullfilled"
    });
  }) as Handler
]

export const put = [
  ratelimit(1, 1000),
  authorization(),
  (async (req, res, next) => {
    const accessUid = req.params["authorized-uid"] as string;
    const accessRole = Number.parseInt(req.params["authorized-role"]) as UserRole;

    const action = req.query.action as string;

    switch (action) {
      case "data": {
        try {
          const data = req.body.data;
          await users.updateUserById(accessUid, data);
          res.status(200).send({
            message: "Request fullfilled"
          });
        }
        catch (ex) {
          res.status(400).send({
            message: (ex as Exception)?.why
          });
        }
        return;
      }

      case "password": {
        try {
          const password = req.body.password;
          await users.updatePasswordById(accessUid, password);
          res.status(200).send({
            message: "Request fullfilled"
          });
        }
        catch (ex) {
          res.status(400).send({
            message: (ex as Exception)?.why
          });
        }
        return;
      }

      default: {
        res.status(400).send({
          message: "No action selected"
        })
      }
    }
  }) as Handler
]

export const del = [
  ratelimit(1, 1000),
  authorization(),
  (async (req, res, next) => {
    const accessUid = req.params["authorized-uid"] as string;
    const accessRole = Number.parseInt(req.params["authorized-role"]) as UserRole;


    res.status(200).send({
      message: "Request fullfilled"
    });
  }) as Handler
]