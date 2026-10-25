import { Int32 } from 'mongodb';
import { HttpError } from '../../common/index.js';

const booksCollectionName = 'books';
const forbiddenGenres = ['Horror', 'Science Fiction'];

async function getBooksCollection(db) {
  const exists = await db.listCollections({ name: booksCollectionName }, { nameOnly: true }).hasNext();
  if (!exists) throw new HttpError(409, 'Create the books collection first with POST /collection/books (Q01).');
  return db.collection(booksCollectionName);
}

function parseInteger(value, label) {
  if (value === undefined || value === null || String(value).trim() === '') {
    throw new HttpError(400, `${label} is required and must be a whole number.`);
  }
  if (!/^-?\d+$/.test(String(value).trim())) throw new HttpError(400, `${label} must be a decimal whole number.`);
  const number = Number(value);
  if (!Number.isSafeInteger(number)) throw new HttpError(400, `${label} must be a safe whole number.`);
  return number;
}

function validateBook(book) {
  if (!book || typeof book !== 'object' || Array.isArray(book)) {
    throw new HttpError(400, 'Each book must be a JSON object.');
  }
  if (typeof book.title !== 'string' || !book.title.trim()) {
    throw new HttpError(400, 'title must be a present, non-empty, non-whitespace string.');
  }
  const normalized = { ...book, title: book.title.trim() };
  if (book.year !== undefined) {
    const year = parseInteger(book.year, 'year');
    if (year < -2147483648 || year > 2147483647) throw new HttpError(400, 'year must fit in a BSON Int32.');
    normalized.year = new Int32(year);
  }
  if (book.genres !== undefined && (!Array.isArray(book.genres) || !book.genres.every((genre) => typeof genre === 'string'))) {
    throw new HttpError(400, 'genres must be an array of strings when supplied.');
  }
  return normalized;
}

export async function createBook(db, input) {
  const books = await getBooksCollection(db);
  const result = await books.insertOne(validateBook(input));
  return { acknowledged: result.acknowledged, insertedId: result.insertedId };
}

export async function createBooks(db, input) {
  const books = await getBooksCollection(db);
  if (!Array.isArray(input) || input.length < 3) throw new HttpError(400, 'Send an array containing at least three books.');
  const result = await books.insertMany(input.map(validateBook));
  const insertedBooks = input.map((book, index) => ({ title: book.title.trim(), _id: result.insertedIds[index] }));
  return {
    acknowledged: result.acknowledged,
    insertedCount: result.insertedCount,
    insertedIds: result.insertedIds,
    insertedBooks,
  };
}

export async function updateFutureBook(db) {
  const books = await getBooksCollection(db);
  const result = await books.updateOne({ title: 'Future' }, { $set: { year: new Int32(2022) } });
  return { acknowledged: result.acknowledged, matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
}

export async function findBookByTitle(db, title) {
  if (typeof title !== 'string' || !title.trim()) throw new HttpError(400, 'title query parameter is required.');
  return (await getBooksCollection(db)).findOne({ title });
}

export async function findBooksByYearRange(db, fromInput, toInput) {
  const from = parseInteger(fromInput, 'from');
  const to = parseInteger(toInput, 'to');
  if (from > to) throw new HttpError(400, 'from must be less than or equal to to.');
  return (await getBooksCollection(db)).find({ year: { $gte: from, $lte: to } }).toArray();
}

export async function findBooksByGenre(db, genre) {
  if (typeof genre !== 'string' || !genre.trim()) throw new HttpError(400, 'genre query parameter is required.');
  return (await getBooksCollection(db)).find({ genres: genre }).toArray();
}

export async function findBooksWithSkipLimit(db) {
  return (await getBooksCollection(db)).find({}).sort({ year: -1 }).skip(2).limit(3).toArray();
}

export async function findBooksWithIntegerYear(db) {
  return (await getBooksCollection(db)).find({ year: { $type: 'int' } }).toArray();
}

export async function findBooksExcludingGenres(db) {
  return (await getBooksCollection(db)).find({ genres: { $exists: true, $nin: forbiddenGenres } }).toArray();
}

export async function deleteBooksBeforeYear(db, yearInput) {
  const year = parseInteger(yearInput, 'year');
  const result = await (await getBooksCollection(db)).deleteMany({ year: { $lt: year } });
  return { acknowledged: result.acknowledged, deletedCount: result.deletedCount };
}

export async function aggregateBooksWithLogs(db, kind) {
  const books = await getBooksCollection(db);
  const after2000 = { $match: { year: { $gt: 2000 } } };
  if (kind === 1) return books.aggregate([after2000, { $sort: { year: -1 } }]).toArray();
  if (kind === 2) return books.aggregate([after2000, { $project: { _id: 0, title: 1, author: 1, year: 1 } }]).toArray();
  if (kind === 3) return books.aggregate([
    { $unwind: '$genres' },
    { $project: { _id: 0, title: 1, genres: 1 } },
  ]).toArray();
  throw new Error(`Unknown books aggregation: ${kind}`);
}

export async function aggregateLogsWithBookDetails(db) {
  await getBooksCollection(db);
  const logsExists = await db.listCollections({ name: 'logs' }, { nameOnly: true }).hasNext();
  if (!logsExists) throw new HttpError(409, 'Create the capped logs collection and insert a log before Q19.');
  return db.collection('logs').aggregate([
    { $lookup: { from: 'books', localField: 'book_id', foreignField: '_id', as: 'book_details' } },
  ]).toArray();
}
