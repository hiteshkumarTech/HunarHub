import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { connectTestDB, closeTestDB, clearTestDB } from '../test/db';
import { Category } from '../models/Category';
import { ensureDefaultCategories } from './ensureCategories';

beforeAll(connectTestDB);
afterAll(closeTestDB);
beforeEach(clearTestDB);

describe('ensureDefaultCategories', () => {
  it('inserts all 5 fixed categories, active, on an empty collection', async () => {
    await ensureDefaultCategories();
    const categories = await Category.find().sort({ id: 1 }).lean();
    expect(categories.map((c) => c.id)).toEqual(['artisan', 'cobbler', 'potter', 'tailor', 'vendor']);
    expect(categories.every((c) => c.active)).toBe(true);
  });

  it('never overwrites an existing category — an admin rename/deactivate survives a redeploy', async () => {
    await Category.create({ id: 'potter', label: 'Potter (Kumhar) — Custom', active: false });
    await ensureDefaultCategories();

    const potter = await Category.findOne({ id: 'potter' }).lean();
    expect(potter?.label).toBe('Potter (Kumhar) — Custom');
    expect(potter?.active).toBe(false);

    // The other 4 still got their defaults inserted alongside the untouched one.
    const all = await Category.find().lean();
    expect(all).toHaveLength(5);
  });

  it('is idempotent — safe to run on every server boot', async () => {
    await ensureDefaultCategories();
    await ensureDefaultCategories();
    expect(await Category.countDocuments()).toBe(5);
  });
});
