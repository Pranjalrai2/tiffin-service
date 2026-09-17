import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    pricePerMonth: { type: Number, required: true, min: 0 },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Plan', planSchema);
