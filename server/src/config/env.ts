import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV ?? 'development';
export const isProd = nodeEnv === 'production';

const INSECURE_JWT = 'dev-secret-change-me';

/**
 * Read an env var. In production a missing value throws (fail fast) instead of
 * silently falling back to an insecure default. In development the fallback is
 * used for convenience.
 */
function required(name: string, devFallback: string): string {
  const value = process.env[name];
  if (value && value.trim().length > 0) return value;
  if (isProd) throw new Error(`[env] Missing required environment variable in production: ${name}`);
  return devFallback;
}

const jwtSecret = required('JWT_SECRET', INSECURE_JWT);
if (isProd && jwtSecret === INSECURE_JWT) {
  throw new Error('[env] JWT_SECRET must be set to a strong, unique value in production');
}

export const env = {
  nodeEnv,
  port: Number(process.env.PORT ?? 4000),
  mongoUri: required('MONGODB_URI', 'mongodb://127.0.0.1:27017/hunarhub'),
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  clientOrigins: (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  // Deliberately NOT fail-fast like MONGODB_URI/JWT_SECRET above: image uploads
  // are one feature, not the whole API. Missing Cloudinary config should only
  // break the upload endpoints (a clear 503 there — see config/cloudinary.ts),
  // not crash-loop the entire server on every other route (auth, orders, browse).
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
  },
};
