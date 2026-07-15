import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env';
import { router } from './routes';
import { notFound, errorHandler } from './middleware/error';

export function createApp() {
  const app = express();

  app.use(express.json({ limit: '1mb' }));
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
  app.use('/api', router);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
