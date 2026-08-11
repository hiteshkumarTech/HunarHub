import { CATEGORY_IDS } from './User';

/** Human-readable default label for each fixed category id — the single
 *  source of truth shared by seed.ts and the production-safe startup
 *  bootstrap (startup/ensureCategories.ts), so the two never drift apart. */
export const CATEGORY_LABELS: Record<(typeof CATEGORY_IDS)[number], string> = {
  cobbler: 'Cobbler',
  potter: 'Potter (Kumhar)',
  tailor: 'Tailor',
  artisan: 'Artisan',
  vendor: 'Vendor',
};
