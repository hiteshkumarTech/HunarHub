import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { router } from './routes';
import { notFound, errorHandler } from './middleware/error';
import { mongoSanitize } from './middleware/sanitize';
import { apiLimiter, authLimiter } from './middleware/rateLimit';

export function createApp() {
  const app = express();

  // Render (and most PaaS) put a proxy in front of the app. Trusting the first
  // proxy lets rate limiting and req.ip see the real client (X-Forwarded-For).
  app.set('trust proxy', 1);

  // API is consumed cross-origin by the Vercel frontend, so allow CORP.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(express.json({ limit: '1mb' }));
  app.use(mongoSanitize);
  app.use(
    cors({
      origin: (origin, cb) => {
        // allow tools/curl (no Origin header), configured origins,
        // any *.vercel.app deployment, and localhost during dev
        if (!origin) return cb(null, true);
        let allowed = env.clientOrigins.includes(origin);
        try {
          const host = new URL(origin).hostname;
          if (host.endsWith('.vercel.app') || host === 'localhost' || host === '127.0.0.1') allowed = true;
        } catch {
          /* malformed origin — leave as not allowed */
        }
        return cb(null, allowed);
      },
      credentials: true,
    }),
  );
  if (env.nodeEnv !== 'test') app.use(morgan('dev'));

  app.get('/health', (_req, res) => res.json({ ok: true, service: 'hunarhub-api', time: new Date().toISOString() }));

  // Rate limiting: a general cap on the whole API, a stricter cap on auth.
  app.use('/api', apiLimiter);
  app.use('/api/auth', authLimiter);
  app.use('/api', router);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
