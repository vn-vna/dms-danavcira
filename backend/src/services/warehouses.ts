import * as uuid from "uuid"
import Lazy from "../utilities/lazy";
import database from "./db"
import Exception from "../exception";
import { Collection } from "mongodb";

export interface WarehouseItem {
  [key: string]: number;
}

export enum WarehouseType {
  General = 0,
  Branch = 1,
  Area = 2
}

export interface WarehouseEntity {
  _id: string;
  name: string;
  type: WarehouseType;
  addr: string;
  long: number;
  lat: number;
  items: WarehouseItem;
}

class WarehouseService {
  private static INSTANCE = new Lazy<WarehouseService>(() => new WarehouseService());

  public static getInstance() {
    return WarehouseService.INSTANCE.instance;
  }

  private collection_: Collection<WarehouseEntity>;

  constructor() {
    this.collection_ = database.collection<WarehouseEntity>("warehouse");
  }

  public async create(name: string, type: WarehouseType, addr: string, long: number, lat: number) {
    const warehouse: WarehouseEntity = {
      _id: uuid.v4(),
      name, type, addr, long, lat, items: {}
    }

    await this.collection_.insertOne(warehouse);
    return warehouse;
  }

  public async search(query: string = "", filter: string = "", page: number = 1) {
    const filterParts = filter.split(",");
    const filterInfo: { [key: string]: string } = {};

    for (const part of filterParts) {
      const [key, value] = part.split("=");
      filterInfo[key] = value;
    }

    const searchQuery = {
      name: { $regex: query, $options: "i" },
    }

    const count = await this.collection_.countDocuments(searchQuery);
    const pages = Math.ceil(count / 10);

    const results = await this.collection_.find(searchQuery).skip((page - 1) * 10).limit(10).toArray();

    return {
      results,
      count,
      pages
    }
  }

  public async getWarehouseById(id: string) {
    const result = await this.collection_.findOne({ _id: id });

    if (!result) {
      throw new Exception("Cannot find warehouse");
    }

    return result;
  }

  public async updateWarehouseById(id: string, data: Partial<WarehouseEntity>) {
    const result = await this.collection_.updateOne({ _id: id }, { $set: data });

    if (result.matchedCount === 0) {
      throw new Exception("Cannot find warehouse");
    }

    return result;
  }

  public async setWarehouseItem(id: string, item: string, quantity: number) {
    const result = await this.collection_.updateOne({ _id: id }, {
      $set: {
        [`items.${item}`]: quantity
      }
    });

    if (result.matchedCount === 0) {
      throw new Exception("Cannot find warehouse");
    }

    return result;
  }

  public async deleteWarehouseItem(id: string, item: string) {
    const result = await this.collection_.updateOne({ _id: id }, {
      $unset: {
        [`items.${item}`]: ""
      }
    });

    if (result.matchedCount === 0) {
      throw new Exception("Cannot find warehouse");
    }

    return result;
  }

  public async deleteWarehouse(id: string) {
    const result = await this.collection_.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      throw new Exception("Cannot find warehouse");
    }

    return result;
  }

}

export default WarehouseService.getInstance();