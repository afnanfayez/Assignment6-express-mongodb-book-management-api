import { Router } from 'express';
import { asyncHandler, sendSuccess } from '../../common/index.js';
import { insertLog } from './log.service.js';

export const logRouter = Router();

logRouter.post('/', asyncHandler(async (req, res) => {
  const data = await insertLog(req.app.locals.database, req.body);
  return sendSuccess(res, { status: 201, message: 'Log inserted with book_id stored as BSON ObjectId.', data });
}));
