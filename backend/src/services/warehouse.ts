import * as uuid from "uuid"
import Lazy from "../utilities/lazy";
import database from "./db"
import Exception from "../exception";
import { Collection } from "mongodb";

export enum WarehouseLevel {
  General = 0,
  Branch = 1,
  Area = 2
}

interface ProductData {
  inStock: number;
}

interface StorateData {
  [key: string]: ProductData;
}

interface GeoLocationInfo {
  lat: number;
  lng: number;
}

interface AdressInfo {
  city: string;
  district: string;
  street: string;
  zipcode: string;
}

interface WarehouseEntity {
  id: string;
  name: string;
  level: WarehouseLevel;
  location: GeoLocationInfo;
  address: AdressInfo;
}

class WarehouseService {
  private static INSTANCE = new Lazy<WarehouseService>(() => new WarehouseService());

  public static getInstance() {
    return WarehouseService.INSTANCE.instance;
  }

  private collection_: Collection<WarehouseEntity>;

  constructor() {
    this.collection_ = database.collection("warehouse");
  }

  public async listWarehouses(search: string, filter: string, page: number) {
    const mongodbQuery = {};

    if (search) {
    }
  }
}

export default WarehouseService.getInstance();