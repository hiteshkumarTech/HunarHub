import { Schema, model } from 'mongoose';

export const ORDER_KINDS = ['service', 'product'] as const;
export const ORDER_STATUSES = ['pending', 'accepted', 'declined', 'completed'] as const;

/** A service request or a product order placed by a customer with an entrepreneur. */
const orderSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    entrepreneur: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    kind: { type: String, enum: ORDER_KINDS, required: true },
    item: { type: Schema.Types.ObjectId }, // Service or Product id (snapshot below keeps history stable)
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending', index: true },
    note: { type: String, default: '' },
  },
  { timestamps: true },
);

// GET /orders/mine and GET /orders/incoming both filter by one party and sort
// by newest first — a compound index serves the filter and the sort together
// (and its leading field also covers the plain-customer / plain-entrepreneur
// lookups, e.g. the earned-review check in routes/reviews.ts).
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ entrepreneur: 1, createdAt: -1 });

export const Order = model('Order', orderSchema);
