import { Router } from 'express';
import { HttpError, asyncHandler, sendSuccess } from '../../common/index.js';
import * as bookService from './book.service.js';

export const bookRouter = Router();
const database = (req) => req.app.locals.database;

bookRouter.post('/batch', asyncHandler(async (req, res) => {
  const data = await bookService.createBooks(database(req), req.body);
  return sendSuccess(res, { status: 201, message: 'Books inserted with one insertMany operation.', data });
}));

bookRouter.get('/title', asyncHandler(async (req, res) => {
  const data = await bookService.findBookByTitle(database(req), req.query.title);
  if (!data) throw new HttpError(404, 'No book has that exact title.');
  return sendSuccess(res, { message: 'Book found.', data });
}));

bookRouter.get('/year', asyncHandler(async (req, res) => {
  const data = await bookService.findBooksByYearRange(database(req), req.query.from, req.query.to);
  return sendSuccess(res, { message: 'Books in the inclusive year range.', data });
}));

bookRouter.get('/genre', asyncHandler(async (req, res) => {
  const data = await bookService.findBooksByGenre(database(req), req.query.genre);
  return sendSuccess(res, { message: 'Books matching the genre.', data });
}));

bookRouter.get('/skip-limit', asyncHandler(async (req, res) => {
  const data = await bookService.findBooksWithSkipLimit(database(req));
  return sendSuccess(res, { message: 'Sorted by year descending, skipped two, and limited to three.', data });
}));

bookRouter.get('/year-integer', asyncHandler(async (req, res) => {
  const data = await bookService.findBooksWithIntegerYear(database(req));
  return sendSuccess(res, { message: 'Books whose year is BSON Int32.', data });
}));

bookRouter.get('/exclude-genres', asyncHandler(async (req, res) => {
  const data = await bookService.findBooksExcludingGenres(database(req));
  return sendSuccess(res, { message: 'Books with a genres field excluding Horror and Science Fiction.', data });
}));

bookRouter.delete('/before-year', asyncHandler(async (req, res) => {
  const data = await bookService.deleteBooksBeforeYear(database(req), req.query.year);
  return sendSuccess(res, { message: 'Books before the requested year deleted.', data });
}));

for (const number of [1, 2, 3]) {
  bookRouter.get(`/aggregate${number}`, asyncHandler(async (req, res) => {
    const data = await bookService.aggregateBooksWithLogs(database(req), number);
    return sendSuccess(res, { message: `Aggregation ${number} completed.`, data });
  }));
}

bookRouter.get('/aggregate4', asyncHandler(async (req, res) => {
  const data = await bookService.aggregateLogsWithBookDetails(database(req));
  return sendSuccess(res, { message: 'Logs joined with matching books.', data });
}));

bookRouter.post('/', asyncHandler(async (req, res) => {
  const data = await bookService.createBook(database(req), req.body);
  return sendSuccess(res, { status: 201, message: 'Book inserted.', data });
}));

bookRouter.patch('/:title', asyncHandler(async (req, res) => {
  if (req.params.title !== 'Future') throw new HttpError(404, 'This assignment update is defined only for the title Future.');
  const data = await bookService.updateFutureBook(database(req));
  if (data.matchedCount === 0) throw new HttpError(404, 'Book Future was not found; insert it with Q06 first.');
  return sendSuccess(res, { message: 'Future year set to 2022.', data });
}));
