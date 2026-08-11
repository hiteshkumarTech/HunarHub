import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { ensureDefaultCategories } from './startup/ensureCategories';

async function main() {
  await connectDB();
  // Non-fatal: a hiccup here shouldn't take the whole API down — categories
  // are a small convenience feature, not core to auth/orders working.
  try {
    await ensureDefaultCategories();
  } catch (err) {
    console.error('Warning: could not ensure default categories exist:', err);
  }
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`✓ HunarHub API listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
