import { Schema, model } from 'mongoose';

const reviewSchema = new Schema(
  {
    entrepreneur: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, default: '' },
  },
  { timestamps: true },
);

// One review per customer per entrepreneur.
reviewSchema.index({ entrepreneur: 1, customer: 1 }, { unique: true });

export const Review = model('Review', reviewSchema);
