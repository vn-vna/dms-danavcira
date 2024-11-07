import database from "./db";
import Lazy from "../utilities/lazy";
import { Collection } from "mongodb";
import * as uuid from "uuid";


export type ReportType = "checkin" | "checkout";

export interface TaskReport {
  type: ReportType;
  long: number;
  lat: number;
}

export interface TaskEntity {
  _id: string;
  user_id: string;
  address: string;
  long: number;
  lat: number;
  report?: TaskReport;
}

class TaskService {
  private static INSTANCE = new Lazy<TaskService>(() => new TaskService());

  public static getInstance() {
    return TaskService.INSTANCE.instance;
  }

  private collection_: Collection<TaskEntity>;

  constructor() {
    this.collection_ = database.collection<TaskEntity>("task");
  }

  public async create(user_id: string, address: string, long: number, lat: number) {
    const task: TaskEntity = {
      _id: uuid.v4(),
      user_id,
      address,
      long,
      lat
    }

    await this.collection_.insertOne(task);
    return task;
  }

  public async search(query: string = "", filter: string = "", page: number = 1) {
    const filterParts = filter.split(",");
    const filterInfo: { [key: string]: string } = {};

    for (const part of filterParts) {
      const [key, value] = part.split("=");
      filterInfo[key] = value;
    }

    const searchQuery = {
      address: { $regex: query, $options: "i" },
    }

    const count = await this.collection_.countDocuments(searchQuery);
    const pages = Math.ceil(count / 10);

    const results = await this.collection_.find({...searchQuery, ...filterInfo})
      .skip((page - 1) * 10)
      .limit(10)
      .toArray();

    return { count, results, pages }
  }

  public async getTaskById(tid: string) {
    return this.collection_.findOne({ _id: tid });
  }

  public async reportTask(tid: string, report: TaskReport) {
    const result = await this.collection_.updateOne({ _id: tid }, { $set: { report } });

    if (result.matchedCount === 0) {
      throw new Error("Cannot find task");
    }

    return result;
  }

  public async deleteTask(tid: string) {
    await this.collection_.deleteOne({ _id: tid });
  }

  public async updateTask(tid: string, data: Partial<TaskEntity>) {
    const result = await this.collection_.updateOne({ _id: tid }, { $set: data });

    if (result.matchedCount === 0) {
      throw new Error("Cannot find task");
    }

    return result;
  }

  public async assignTask(tid: string, uid: string) {
    await this.collection_.updateOne({ _id: tid }, { $set: { user_id: uid } });
  }

}

export default TaskService.getInstance();