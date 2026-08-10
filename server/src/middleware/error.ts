import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { ApiError } from '../utils/ApiError';

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not found' });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message, details: err.details ?? undefined });
  }
  // Multer's own validation errors (file too large, too many files, wrong
  // field name) — translate into the same clean shape as everything else
  // rather than letting a raw MulterError reach the client.
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Image is too large — 5MB max per image.'
        : err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE'
          ? 'Too many images for this listing.'
          : 'Could not process the uploaded image.';
    return res.status(400).json({ error: message });
  }
  // Mongoose duplicate key
  if (typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000) {
    return res.status(409).json({ error: 'A record with that value already exists' });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
}
