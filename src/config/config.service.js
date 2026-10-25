import 'dotenv/config';

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

export const config = Object.freeze({
  port,
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017',
  databaseName: process.env.MONGODB_DB_NAME ?? 'assignment7_express',
});
