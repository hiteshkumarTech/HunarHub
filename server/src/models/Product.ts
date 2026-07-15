import { Schema, model } from 'mongoose';

const productSchema = new Schema(
  {
    entrepreneur: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' },
  },
  { timestamps: true },
);

export const Product = model('Product', productSchema);
