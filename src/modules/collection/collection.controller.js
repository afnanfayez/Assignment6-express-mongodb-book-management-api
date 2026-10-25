import { Router } from 'express';
import { asyncHandler, sendSuccess } from '../../common/index.js';
import * as collectionService from './collection.service.js';

export const collectionRouter = Router();

collectionRouter.post('/books', asyncHandler(async (req, res) => {
  const data = await collectionService.createBooksCollection(req.app.locals.database);
  return sendSuccess(res, { status: data.alreadyExists ? 200 : 201, message: 'Books collection is ready.', data });
}));

collectionRouter.post('/authors', asyncHandler(async (req, res) => {
  const result = await collectionService.insertAuthor(req.app.locals.database, req.body);
  return sendSuccess(res, { status: 201, message: 'Author inserted; MongoDB creates authors implicitly.', data: result });
}));

collectionRouter.post('/logs/capped', asyncHandler(async (req, res) => {
  const data = await collectionService.createCappedLogsCollection(req.app.locals.database);
  return sendSuccess(res, { status: data.alreadyExists ? 200 : 201, message: 'Capped logs collection is ready.', data });
}));

collectionRouter.post('/books/index', asyncHandler(async (req, res) => {
  const data = await collectionService.createBooksTitleIndex(req.app.locals.database);
  return sendSuccess(res, { message: 'Ascending title index created.', data });
}));
