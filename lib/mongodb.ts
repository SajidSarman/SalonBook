import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error("MONGODB_URI must be set to connect to the database.")
}

const globalForMongo = globalThis as typeof globalThis & {
  salonBookMongoClient?: MongoClient
}

export const client =
  globalForMongo.salonBookMongoClient ?? new MongoClient(uri)

if (process.env.NODE_ENV !== "production") {
  globalForMongo.salonBookMongoClient = client
}

export const db = client.db("SalonBook_DB")
