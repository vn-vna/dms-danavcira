import { MongoClient, UUID } from "mongodb";
import config from "config";
import * as uuid from "uuid";
import Lazy from "../utilities/lazy";

class Database {
  private static INSTANCE = new Lazy<Database>(() => new Database());

  public static getInstance() {
    return Database.INSTANCE.instance
  }

  client_: MongoClient;

  constructor() {
    const url: string = config.get("database.url");
    this.client_ = new MongoClient(url, {
      pkFactory: { createPk: () => uuid.v6() }
    });
  }

  get client() {
    return this.client_;
  }

  get appDb() {
    const dbname: string = config.get("database.dbname");
    return this.client_.db(dbname);
  }
}

export default Database.getInstance().appDb