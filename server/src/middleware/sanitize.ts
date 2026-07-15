import type { Request, Response, NextFunction } from 'express';

/**
 * Strip MongoDB operator keys (`$...`) and dotted keys from request input to
 * prevent NoSQL operator/query injection (e.g. `{ "email": { "$gt": "" } }`).
 *
 * Dependency-free and Express-4 safe: it mutates the existing objects in place
 * rather than reassigning `req.query` (which is a getter in Express 5).
 */
function scrub(value: unknown): void {
  if (!value || typeof value !== 'object') return;
  for (const key of Object.keys(value as Record<string, unknown>)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete (value as Record<string, unknown>)[key];
      continue;
    }
    scrub((value as Record<string, unknown>)[key]);
  }
}

export function mongoSanitize(req: Request, _res: Response, next: NextFunction) {
  scrub(req.body);
  scrub(req.query);
  scrub(req.params);
  next();
}
