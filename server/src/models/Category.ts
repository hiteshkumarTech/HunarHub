import { Schema, model } from 'mongoose';
import { CATEGORY_IDS } from './User';

/**
 * Admin-manageable display metadata (label, active/inactive) for the craft
 * categories the assignment defines (cobbler/potter/tailor/artisan/vendor).
 *
 * Deliberately NOT a fully dynamic taxonomy: the set of valid `id`s stays the
 * fixed enum from User.ts (Mongoose enum here + Zod enums in auth.ts and
 * entrepreneurs.ts), so an entrepreneur's `profile.category` validation is
 * untouched. Only `label` and `active` are admin-editable. Adding a genuinely
 * new category id would also require updating those two Zod enums, the
 * frontend's CategoryId union type, and its icon map (craftIcons.tsx) — real,
 * coupled changes across both apps that are disproportionate for an
 * internship-scope pass. See ROADMAP.md for this trade-off written out.
 */
const categorySchema = new Schema(
  {
    id: { type: String, enum: CATEGORY_IDS, required: true, unique: true },
    label: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Category = model('Category', categorySchema);
