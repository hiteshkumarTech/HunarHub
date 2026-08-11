import { Schema, model } from 'mongoose';

// publicId is nullable, not required: seeded/placeholder images (Picsum URLs,
// pre-Cloudinary data) legitimately have no Cloudinary asset to reference —
// see serialize.ts's imagesJson and the seed script. Only real Cloudinary
// uploads populate a real publicId.
const imageSchema = new Schema({ url: { type: String, required: true }, publicId: { type: String, default: null } }, { _id: false });

// Products support a small gallery — up to 4 images, first = cover (enforced
// in the route layer, not here, since Mongoose array validators fire on every
// save regardless of what actually changed).
export const PRODUCT_MAX_IMAGES = 4;

const productSchema = new Schema(
  {
    entrepreneur: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    images: { type: [imageSchema], default: [] },
    // Legacy single-URL field from before Cloudinary uploads existed. No
    // longer written by new code, but kept (not removed) so older seeded/
    // production documents that only have this still serialize and render —
    // see serialize.ts's productJson fallback.
    image: { type: String, default: '' },
  },
  { timestamps: true },
);

export const Product = model('Product', productSchema);
