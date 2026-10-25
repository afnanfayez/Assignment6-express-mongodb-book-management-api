export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function sendSuccess(res, { status = 200, message, data }) {
  return res.status(status).json({ message, data });
}
