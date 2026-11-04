import { MongoClient } from "mongodb";

// The client only connects on first use, so a missing URI does not break the build
const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";

const globalForMongo = globalThis as typeof globalThis & { _mongoClient?: MongoClient };

export const client = globalForMongo._mongoClient ?? new MongoClient(uri);

if (process.env.NODE_ENV !== "production") {
  globalForMongo._mongoClient = client;
}
