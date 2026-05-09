import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    content: { type: String, required: true },
    isAnonymous: { type: Boolean, default: false },
    scores: {
      cleanliness: { type: Number, min: 1, max: 5 },
      safety: { type: Number, min: 1, max: 5 },
      noise: { type: Number, min: 1, max: 5 },
      connectivity: { type: Number, min: 1, max: 5 },
      value: { type: Number, min: 1, max: 5 },
    },
    pros: [String],
    cons: [String],
    images: [String],
    isVerified: { type: Boolean, default: false },
    helpfulVotes: { type: Number, default: 0 },
    ownerResponse: {
      content: String,
      respondedAt: Date,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ property: 1, reviewer: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);