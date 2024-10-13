import { Collection } from "mongodb";
import Lazy from "../utilities/lazy";
import database from "./db";
import * as uuid from "uuid";


interface ProductEntity {
  _id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
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

  public async getProducts() {
    return this.collection_.find();
  }

  public async getProduct(id: string) {
    return this.collection_.findOne({ _id: id });
  }

  public async createProduct(data: ProductEntityView) {
    const id = uuid.v4();
    return this.collection_.insertOne({ _id: id, ...data });
  }

  public async updateProduct(id: string, data: ProductEntityView) {
    return this.collection_.updateOne({ _id: id }, { $set: { ...data } });
  }

  public async deleteProduct(id: string) {
    return this.collection_.deleteOne({ _id: id });
  }
}