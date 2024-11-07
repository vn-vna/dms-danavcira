import CryptoJS from "crypto-js";
import { MongoClient } from "mongodb";
import { type UserEntity } from "../src/services/users";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

(async () => {
  const SERVER_URL = 'http://localhost:3000'
  const SECRET_KEY = 'some_key'

  let client = await MongoClient.connect(
    "mongodb://localhost:27017",
    {
      auth: {
        username: "root",
        password: "example",
      }
    }
  );
  let db = client.db("dms");
  let collection = db.collection<UserEntity>("user");

  // Create admin user
  await collection.insertOne({
    _id: '1ef8b167-41e0-6300-a6e4-4c2f9af554dc',
    username: 'vnvna',
    data: {},
    role: 0,
    password: '$2b$10$aon1WSPrEUPtXBurxBYHt.J7.pdzhxNHyaT3Z/amNQP6c8t3VU3HG',
  });

  console.log('Admin user created');

  client.close();
})();