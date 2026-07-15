import { Schema, model, InferSchemaType } from 'mongoose';

export const CATEGORY_IDS = ['cobbler', 'potter', 'tailor', 'artisan', 'vendor'] as const;
export const ROLES = ['customer', 'entrepreneur', 'admin'] as const;

/** Entrepreneur-only profile, embedded on the user when role === 'entrepreneur'. */
const profileSchema = new Schema(
  {
    category: { type: String, enum: CATEGORY_IDS },
    craft: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    exp: { type: Number, default: 0 },
    bio: { type: String, default: '' },
    startingPrice: { type: Number, default: 0 },
    available: { type: Boolean, default: true },
    verified: { type: Boolean, default: false },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: 'customer', index: true },
    profile: { type: profileSchema, default: undefined },
  },
  { timestamps: true },
);

// Text index to support the Browse search box.
userSchema.index({ name: 'text', 'profile.craft': 'text', 'profile.city': 'text', 'profile.state': 'text' });

export type UserDoc = InferSchemaType<typeof userSchema>;
export const User = model('User', userSchema);
