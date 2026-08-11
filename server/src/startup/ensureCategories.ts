import { Category } from '../models/Category';
import { CATEGORY_IDS } from '../models/User';
import { CATEGORY_LABELS } from '../models/categoryLabels';

/**
 * Idempotent, upsert-only bootstrap for the Category collection — inserts a
 * default row (label + active:true) for any of the 5 fixed category ids that
 * doesn't already exist; never touches a row that's already there, so an
 * admin's rename/deactivate is never overwritten by a redeploy.
 *
 * Exists because `GET /api/categories` predates M10 on any database that was
 * already running before this milestone (including production, which this
 * session has no direct write access to — see ROADMAP.md). Without this, an
 * already-deployed database would serve an empty category list forever,
 * silently breaking Register's category picker (it now reads live from this
 * endpoint instead of a compiled-in constant). Safe to run on every server
 * boot: at most 5 cheap upserts, a no-op once the rows exist.
 */
export async function ensureDefaultCategories(): Promise<void> {
  await Promise.all(
    CATEGORY_IDS.map((id) =>
      Category.updateOne({ id }, { $setOnInsert: { id, label: CATEGORY_LABELS[id], active: true } }, { upsert: true }),
    ),
  );
}
