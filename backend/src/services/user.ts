import Lazy from "../utilities/lazy"
import database from "./db"
import * as uuid from "uuid";
import bcrypt from "bcrypt"
import Exception from "../exception";
import jwt from "jsonwebtoken"
import config from "config"
import { AuthenticationJwtPayload } from "../middlewares/authentication";
import { Collection } from "mongodb";

export enum UserRole {
  SystemAdministrator = 0,
  GeneralManager = 1,
  BranchManager = 2,
  SaleManager = 3,
  Officer = 4,
  Staff = 5,
  Customer = 6,
}

export type SessionMapping = { [key: string]: number };

export interface UserData {
  firstname?: string;
  lastname?: string;
}

export interface UserEntity {
  _id: string;
  username: string;
  data: UserData;
  password: string;
  role: UserRole;
}

export interface UserEntityView extends Omit<UserEntity, "password"> { }

export class SessionStorage {
  private sessions_: SessionMapping;

  constructor() {
    this.sessions_ = {};
  }

  public register(session: string) {
    this.sessions_[session] = Date.now();
  }

  public check(session: string) {
    const crrTime = Date.now();
    if (this.sessions_[session] && (crrTime - this.sessions_[session] < 10 * 60000)) {
      this.sessions_[session] = crrTime;
      return true;
    }

    delete this.sessions_[session];
    return false;
  }
}

export class UserService {
  private static INSTANCE = new Lazy<UserService>(() => {
    return new UserService()
  })

  private sessions_: SessionStorage;
  private collection_: Collection<UserEntity>;

  public static getInstance() {
    return UserService.INSTANCE.instance
  }

  constructor() {
    this.sessions_ = new SessionStorage();
    this.collection_ = database.collection<UserEntity>("user");
  }

  public async getUserById(uid: string) {
    const result = await this.collection_.findOne({ id: uid });

    if (!result) {
      return;
    }

    return { ...result } as UserEntity;
  }

  public async updateUserById(uid: string, data: UserData) {
    const result = await this.collection_.updateOne({ id: uid }, {
      $set: { data }
    });

    if (!result.acknowledged) {
      throw new Exception("Cannot perform update operation");
    }

    if (result.matchedCount < 1) {
      throw new Exception("Cannot find user to update info");
    }
  }

  public async updatePasswordById(uid: string, pwd: string) {
    const user = await this.getUserById(uid);

    const password = await bcrypt.hash(`${user?.username}--${pwd}`, 10);
    const result = await this.collection_.updateOne({ id: uid }, {
      $set: { password }
    });

    if (!result.acknowledged) {
      throw new Exception("Cannot perform update operation");
    }

    if (result.matchedCount < 1) {
      throw new Exception("Cannot find user to change password");
    }
  }

  public async getUserByUsername(username: string) {
    const result = await this.collection_.findOne({ username });

    if (!result) {
      return;
    }

    const { _id, ...user } = result;

    return user as UserEntity;
  }

  public async signup(username: string, pwd: string, role: UserRole) {
    const foundUser = await this.getUserByUsername(username);
    if (foundUser) {
      throw new Exception(`Username "${username}" exists`);
    }

    const sessions = {} as SessionMapping;
    const password = await bcrypt.hash(`${username}--${pwd}`, 10);
    const userid = uuid.v6();
    const newUser = { _id: userid, username, data: {}, role, password, sessions };
    const result = await this.collection_.insertOne(newUser);

    if (!result.acknowledged) {
      throw new Exception(`Cannot create user ${username}`);
    }
  }

  public async login(username: string, pwd: string) {
    const user = await this.getUserByUsername(username);
    if (!user) {
      throw new Exception(`Username ${username} does not exist`)
    }

    const { _id: id, password, role } = user;
    const validatedPassword = await bcrypt.compare(`${username}--${pwd}`, password);
    if (!validatedPassword) {
      throw new Exception(`Password is not correct`);
    }

    const session = uuid.v7();
    this.sessions_.register(session);
    return this.getToken(id, role, session);
  }

  public async getToken(id: string, role: UserRole, session: string) {
    const key = config.get("secret.jwt.key") as string;
    const payload = { id, role, session } as AuthenticationJwtPayload;
    return jwt.sign(payload, key);
  }

  public checkSession(session: string) {
    return this.sessions_.check(session);
  }

  public async list(query?: string, filter?: string, page?: number) {
    query = query ?? "";
    filter = filter ?? "";
    page = page ?? 1;
    const mongoQuery = {} as { [key: string]: any };

    const regex = new RegExp(`${query}.*`);
    mongoQuery["$or"] = [
      { "username": { "$regex": regex } },
      { "data.firstname": { "$regex": regex } },
      { "data.lastname": { "$regex": regex } },
    ];

    const filters = filter.split(",")
      .map((fstr) => {
        const fres = fstr.split("=");

        if (fres.length != 2) {
          return null;
        }

        switch (fres[0]) {
          case "role":
            return { key: "role", value: Number.parseInt(fres[1]) as UserRole }

          default:
            return null;
        }
      })
      .filter((pred) => pred !== null);

    for (let f of filters) {
      mongoQuery[f.key] = f.value;
    }

    const results = await this.collection_.find(mongoQuery)
      .skip(10 * (page - 1))
      .limit(10)
      .map((doc) => {
        const { password, ...user } = doc;
        return user as UserEntityView;
      })
      .toArray();

    return results;
  }
}

export default UserService.getInstance()
