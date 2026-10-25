import { ObjectId } from 'mongodb';
import { HttpError } from '../../common/index.js';

export async function insertLog(db, input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new HttpError(400, 'Send a JSON object containing book_id and action.');
  }
  if (typeof input.action !== 'string' || !input.action.trim()) {
    throw new HttpError(400, 'action must be a non-empty string.');
  }
  if (typeof input.book_id !== 'string' || !/^[a-fA-F0-9]{24}$/.test(input.book_id) || !ObjectId.isValid(input.book_id)) {
    throw new HttpError(400, 'book_id must be a 24-character hexadecimal MongoDB ObjectId string.');
  }
  const logsExists = await db.listCollections({ name: 'logs' }, { nameOnly: true }).hasNext();
  if (!logsExists) throw new HttpError(409, 'Create the capped logs collection first with POST /collection/logs/capped (Q03).');

  const bookId = new ObjectId(input.book_id);
  const bookExists = await db.collection('books').findOne({ _id: bookId }, { projection: { _id: 1 } });
  if (!bookExists) throw new HttpError(404, 'No book exists with the supplied book_id. Use an actual inserted book _id.');

  const result = await db.collection('logs').insertOne({ action: input.action.trim(), book_id: bookId });
  return { acknowledged: result.acknowledged, insertedId: result.insertedId, book_id: bookId };
}
