import { Schema, model } from 'mongoose';

export const COMPLAINT_STATUSES = ['open', 'in_review', 'resolved'] as const;

/** A customer or entrepreneur reporting an issue, optionally tied to an order. */
const complaintSchema = new Schema(
  {
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', default: undefined },
    subject: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    status: { type: String, enum: COMPLAINT_STATUSES, default: 'open', index: true },
    adminNote: { type: String, default: '', maxlength: 2000 },
  },
  { timestamps: true },
);

export const Complaint = model('Complaint', complaintSchema);
