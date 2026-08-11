import { Schema, model } from 'mongoose';

// publicId is nullable, not required — see Product.ts for why.
const imageSchema = new Schema({ url: { type: String, required: true }, publicId: { type: String, default: null } }, { _id: false });

// Services get a single photo slot, not a gallery — modelled as a 0-or-1
// array (same shape as Product.images) purely so both routes can share one
// upload/cleanup helper, not because services need multiple images.
export const SERVICE_MAX_IMAGES = 1;

const serviceSchema = new Schema(
  {
    entrepreneur: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    dur: { type: String, default: '' },
    images: { type: [imageSchema], default: [] },
  },
  { timestamps: true },
);

export const Service = model('Service', serviceSchema);
