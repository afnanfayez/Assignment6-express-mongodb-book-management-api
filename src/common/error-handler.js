import { HttpError } from './response.js';

export function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

export function errorHandler(error, req, res, _next) {
  if (res.headersSent) return;
  const status = error instanceof HttpError ? error.status : (Number.isInteger(error.status) && error.status >= 400 && error.status < 500 ? error.status : 500);
  const body = { message: error.message || 'An unexpected server error occurred.' };
  if (error.details !== undefined) body.details = error.details;
  if (status === 500) console.error(error);
  return res.status(status).json(body);
}
