import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    address: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Customer', customerSchema);
