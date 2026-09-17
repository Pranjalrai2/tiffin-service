import mongoose from 'mongoose';

const billSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    totalWeekdays: { type: Number, required: true },
    pausedDays: { type: Number, required: true },
    billableDays: { type: Number, required: true },
    ratePerDay: { type: Number, required: true },
    finalAmount: { type: Number, required: true },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Bill', billSchema);
