import { Schema, model } from 'mongoose';

/** A customer's saved entrepreneur (wishlist entry). */
const favoriteSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    entrepreneur: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true },
);

// One favourite per (customer, entrepreneur) pair.
favoriteSchema.index({ user: 1, entrepreneur: 1 }, { unique: true });

export const Favorite = model('Favorite', favoriteSchema);
