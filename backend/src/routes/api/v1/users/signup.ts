import { Handler } from "express";
import ratelimit from "../../../../middlewares/ratelimit";
import users, { UserRole } from "../../../../services/users"
import Exception from "../../../../exception";

export const post = [
  ratelimit(1, 1000), // 1 req/s
  (async (req, res, next) => {
    const username = req.body.username as string;
    const password = req.body.password as string;

    try {
      await users.signup(username, password, UserRole.Staff);
      res.status(201).send({
        message: "User created successfully"
      })
    }
    catch (ex) {
      res.status(400).send({
        message: (ex as Exception)?.why
      });
    }
  }) as Handler
]