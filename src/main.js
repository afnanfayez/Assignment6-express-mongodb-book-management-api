import express from 'express';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { connectToDatabase, closeDatabase } from './database/connection.js';
import { config } from './config/config.service.js';
import { errorHandler } from './common/index.js';
import { collectionRouter } from './modules/collection/collection.controller.js';
import { bookRouter } from './modules/books/book.controller.js';
import { logRouter } from './modules/logs/log.controller.js';

export function createApp(database) {
  const app = express();
  app.locals.database = database;
  app.use(express.json({ limit: '1mb' }));
  app.use('/collection', collectionRouter);
  app.use('/books', bookRouter);
  app.use('/logs', logRouter);
  app.use((req, res) => res.status(404).json({ message: `No route for ${req.method} ${req.originalUrl}.` }));
  app.use(errorHandler);
  return app;
}

async function startServer() {
  const database = await connectToDatabase();
  const app = createApp(database);
  const server = app.listen(config.port, () => {
    console.log(`Assignment 7 API listening at http://localhost:${config.port}`);
    console.log(`MongoDB database: ${database.databaseName}`);
  });

  let closing = false;
  const shutdown = () => {
    if (closing) return;
    closing = true;
    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  startServer().catch((error) => {
    console.error('Could not start Assignment 7 API:', error.message);
    process.exitCode = 1;
  });
}
