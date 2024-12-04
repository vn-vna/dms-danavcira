import database from "./db";
import Lazy from "../utilities/lazy";
import { Collection } from "mongodb";
import * as uuid from "uuid";
import parseFilterString from "../utilities/syntaxes";


export type ReportType = "checkin" | "checkout" | "order";

export interface TaskReport {
  type: ReportType;
  long?: number;
  lat?: number;
  reported_date: string;
  thumbnail?: string;
  order_id?: string;
}

export interface TaskEntity {
  _id: string;
  user_id: string;
  customer_id: string;
  created_date: string;
  order_id?: string;
  report?: TaskReport[];
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

  public async create(user_id: string, data: Partial<TaskEntity>) {
    const task = {
      ...data,
      _id: uuid.v4(),
      user_id,
      created_date: new Date().toISOString()
    }

    await this.collection_.insertOne(task as TaskEntity);
    return task;
  }

  public async search(query: string = "", filter: string = "", page: number = 1, from: string = "2000-01-01T00:00:00.000Z", to: string = new Date().toISOString()) {
    const searchQuery = {
      "$or": [
        { customer_name: { "$regex": query, "$options": "i" } },
        { description: { "$regex": query, "$options": "i" } },
        { address: { "$regex": query, "$options": "i" } }
      ],
      created_date: { $gte: from, $lte: to }
    } as { [key: string]: any };

    for (const [fk, fv] of Object.entries(parseFilterString(filter))) {
      if (fk !== undefined && fv !== undefined) {
        searchQuery[fk] = fv;
      }
    }

    const count = await this.collection_.countDocuments(searchQuery);
    const pages = Math.ceil(count / 10);

    const results = await this.collection_.find({ ...searchQuery })
      .skip((page - 1) * 10)
      .limit(10)
      .toArray();

    return { count, results, pages }
  }

  public async getTaskById(tid: string) {
    return this.collection_.findOne({ _id: tid });
  }

  public async reportTask(tid: string, report: TaskReport) {
    const result = await this.collection_.updateOne({ _id: tid }, { $push: { report: report } });

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