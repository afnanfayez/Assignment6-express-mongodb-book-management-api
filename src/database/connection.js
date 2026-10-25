import { MongoClient } from 'mongodb';
import { config } from '../config/config.service.js';

let client;
let database;

export async function connectToDatabase({ uri = config.mongoUri, databaseName = config.databaseName } = {}) {
  if (database) return database;
  client = new MongoClient(uri);
  await client.connect();
  database = client.db(databaseName);
  return database;
}

export function getDatabase() {
  if (!database) throw new Error('MongoDB is not connected. Call connectToDatabase() first.');
  return database;
}

export async function closeDatabase() {
  if (client) await client.close();
  client = undefined;
  database = undefined;
}
