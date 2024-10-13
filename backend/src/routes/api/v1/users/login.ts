import { Handler } from "express";
import ratelimit from "../../../../middlewares/ratelimit";
import users from "../../../../services/user"
import Exception from "../../../../exception";

export const post = [
  ratelimit(1, 1000), // 1 req/s
  (async (req, res, next) => {
    const username = req.body.username as string;
    const password = req.body.password as string;

    try {
      const token = await users.login(username, password);
      res.status(200).send({
        payload: { token },
        message: "Login completed"
      });
    }
    catch (ex) {
      res.status(400).send({
        message: (ex as Exception)?.why
      });
    }
  }) as Handler
]