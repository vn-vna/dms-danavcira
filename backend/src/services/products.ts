import { Collection } from "mongodb";
import Lazy from "../utilities/lazy";
import database from "./db";
import * as uuid from "uuid";


interface ProductEntity {
  _id: string;
  name: string;
  price: number;
  unit: string;
  thumbnail?: string;
}

interface ProductEntityView extends Omit<ProductEntity, "_id"> { }

class ProductService {
  private static INSTANCE = new Lazy<ProductService>(() => {
    return new ProductService()
  })

  private collection_: Collection<ProductEntity>;

  public static getInstance() {
    return ProductService.INSTANCE.instance
  }

  constructor() {
    this.collection_ = database.collection<ProductEntity>("product");
  }

  public async create(name: string, price: number, unit: string, thumbnail?: string) {
    const product: ProductEntity = {
      _id: uuid.v4(),
      name,
      price,
      unit,
      thumbnail
    }

    await this.collection_.insertOne(product);
    return product;
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

    const results = await this.collection_
      .find({...searchQuery, ...filterInfo})
      .project({ thumbnail: 0 })
      .skip((page - 1) * 10)
      .limit(10)
      .toArray();

    return { count, results, pages }
  }

  public async getProductById(pid: string) {
    const result = await this.collection_.findOne({ _id: pid });

    if (!result) {
      return;
    }

    return { ...result } as ProductEntity;
  }

  public async updateProduct(pid: string, name: string, price: number, unit: string, thumbnail?: string) {
    const product: ProductEntity = {
      _id: pid,
      name,
      price,
      unit,
      thumbnail
    }

    await this.collection_.updateOne({ _id: pid }, { $set: product });
    return product;
  }

  public async deleteProduct(pid: string) {
    return await this.collection_.deleteOne({
      _id: pid
    });
  }

}

export default ProductService.getInstance();