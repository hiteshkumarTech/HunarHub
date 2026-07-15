import rateLimit from 'express-rate-limit';

/** General cap across the API to blunt abuse/scraping. */
export const apiLimiter = rateLimit({
  windowMs: 60_000, // 1 minute
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please slow down and try again shortly.' },
});

/** Stricter cap on auth endpoints to blunt credential brute-forcing. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60_000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please wait a few minutes and try again.' },
});
