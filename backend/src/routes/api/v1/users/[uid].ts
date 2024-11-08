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
    const uid = req.params["uid"] as string;

    let allowAccess = (accessUid === uid) || (accessRole < UserRole.GeneralManager);

    if (!allowAccess) {
      res.status(403).send({
        message: "Unauthorized"
      })
      return;
    }

    const user = await users.getUserById(uid);

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
  authorization(),
  (async (req, res, next) => {
    const accessUid = req.params["authorized-uid"] as string;
    const accessRole = Number.parseInt(req.params["authorized-role"]) as UserRole;
    const uid = req.params["uid"] as string;
    let allowAccess = (accessUid === uid) || (accessRole < UserRole.GeneralManager);

    if (!allowAccess) {
      res.status(403).send({
        message: "Unauthorized"
      });
      return;
    }

    const action = req.query.action as string;

    switch (action) {
      case "data": {
        try {
          const data = req.body;
          await users.updateUserById(uid, data);
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
          await users.updatePasswordById(uid, password);
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
  authorization(),
  (async (req, res, next) => {
    const accessUid = req.params["authorized-uid"] as string;
    const accessRole = Number.parseInt(req.params["authorized-role"]) as UserRole;
    const uid = req.params["uid"] as string;
    let allowAccess = (accessUid === uid) || (accessRole <= UserRole.GeneralManager);

    if (!allowAccess) {
      res.status(403).send({
        message: "Unauthorized"
      });
      return;
    }

    res.status(200).send({
      message: "Request fullfilled"
    });
  }) as Handler
]