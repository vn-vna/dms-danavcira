import { Handler } from "express";
import jwt from "jsonwebtoken"
import config from "config"
import users, { UserRole } from "../services/user";

export interface AuthenticationJwtPayload {
  id: string,
  role: UserRole,
  session: string,
}

export function authorization(role: UserRole | undefined = undefined) {
  return (async (req, res, next) => {
    const authHeader = req.header("authorization");
    const tokens = authHeader?.split(" ");

    if (!tokens || tokens.length != 2 || tokens[0] != "Bearer") {
      res.status(403).send({
        message: "Missing authentication"
      })
      return;
    }

    const key = config.get("secret.jwt.key") as string
    const payload = jwt.verify(tokens[1], key) as AuthenticationJwtPayload;

    req.params["authorized-uid"] = payload.id;
    req.params["authorized-role"] = payload.role.toString();
    req.params["authorized-session"] = payload.session;

    if (!users.checkSession(payload.session)) {
      res.status(401).send({
        message: "Token expired"
      })
      return;
    }

    if ((!role || payload.role <= role!)) {
      next();
      return;
    }

    res.status(403).send({
      message: "Permission required"
    })
  }) as Handler
}
