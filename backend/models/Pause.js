import mongoose from 'mongoose';

const pauseSchema = new mongoose.Schema(
  {
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    reason: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Pause', pauseSchema);
