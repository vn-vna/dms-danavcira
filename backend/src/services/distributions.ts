import { Collection } from "mongodb";
import database from "./db";
import Lazy from "../utilities/lazy";
import * as uuid from "uuid";

export interface DistributionItems {
  [key: string]: number;
}

export interface DistributionEntity {
  _id: string;
  user_id: string;
  source_id: string;
  destination_id: string;
  items: DistributionItems;
}

class DistributionService {
  private static INSTANCE = new Lazy<DistributionService>(() => new DistributionService());

  public static getInstance() {
    return DistributionService.INSTANCE.instance;
  }

  private collection_: Collection<DistributionEntity>;

  constructor() {
    this.collection_ = database.collection<DistributionEntity>("distribution");
  }

  public async create(user_id: string, source_id: string, destination_id: string, items: DistributionItems) {
    const distribution: DistributionEntity = {
      _id: uuid.v4(),
      user_id,
      source_id,
      destination_id,
      items
    }

    await this.collection_.insertOne(distribution);
    return distribution;
  }

  public async search(query: string = "", filter: string = "", page: number = 1) {
    const filterParts = filter.split(",");
    const filterInfo: { [key: string]: string } = {};

    for (const part of filterParts) {
      const [key, value] = part.split("=");
      filterInfo[key] = value;
    }

    const searchQuery = {
      ...filterInfo
    }

    const results = await this.collection_.find(searchQuery).skip((page - 1) * 10).limit(10).toArray();
    return results;
  }

  public async getDistributionById(id: string) {
    return await this.collection_.findOne({ _id: id });
  }

  public async updateDistribution(id: string, data: Partial<DistributionEntity>) {
    await this.collection_.updateOne({
      _id: id
    }, { $set: data });
    return await this.getDistributionById(id);
  }

  public async deleteDistribution(id: string) {
    await this.collection_.deleteOne({ _id: id });
  }

}

export default DistributionService.getInstance();