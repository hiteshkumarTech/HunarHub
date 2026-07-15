import { Schema, model } from 'mongoose';

const serviceSchema = new Schema(
  {
    entrepreneur: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    dur: { type: String, default: '' },
  },
  { timestamps: true },
);

export const Service = model('Service', serviceSchema);
