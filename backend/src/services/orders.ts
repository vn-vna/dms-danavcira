import database from "./db";
import { Collection } from "mongodb";
import Lazy from "../utilities/lazy";
import * as uuid from "uuid";
import parseFilterString from "../utilities/syntaxes";

export interface OrderItem {
  [key: string]: number;
}

export interface OrderEntity {
  _id: string;
  user_id: string;
  customer_id: string;
  items: OrderItem;
  task_id?: string;
  completed: boolean;
  created_date: Date;
}

class OrderService {
  private static INSTANCE = new Lazy<OrderService>(() => new OrderService());

  public static getInstance() {
    return OrderService.INSTANCE.instance;
  }

  private collection_: Collection<OrderEntity>;

  constructor() {
    this.collection_ = database.collection<OrderEntity>("order");
  }

  public async create(data: Partial<OrderEntity>) {
    const order = {
      ...data,
      _id: uuid.v4(),
    } as OrderEntity;

    await this.collection_.insertOne(order);
    return order;
  }

  public async search(
    query: string = "",
    filter: string = "",
    page: number = 1,
    from: string = "2000-01-01T00:00:00.000Z",
    to: string = new Date().toISOString()
  ) {
    const mongoQuery = {} as { [key: string]: any };

    const filterParts = parseFilterString(filter);

    for (let [fk, fv] of Object.entries(filterParts)) {
      mongoQuery[fk] = fv;
    }

    mongoQuery["created_date"] = { $gte: from, $lte: to };

    const count = await this.collection_.countDocuments(mongoQuery);

    const results = await this.collection_.find(mongoQuery)
      .skip(10 * (page - 1))
      .limit(10)
      .toArray();

    const pages = Math.ceil(count / 10);

    return { results, count, pages };
  }

  public async getById(id: string) {
    return await this.collection_.findOne({ _id: id });
  }

  public async update(id: string, order: Partial<OrderEntity>) {
    await this.collection_.updateOne({ _id: id }, { $set: order });
    return await this.collection_.findOne({ _id: id });
  }

  public async delete(id: string) {
    await this.collection_.deleteOne({ _id: id });
  }

}

export default OrderService.getInstance();