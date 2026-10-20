import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    skill: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    requesterName: { type: String, required: true },
    requesterEmail: { type: String, required: true, lowercase: true, trim: true },
    requesterRole: { type: String, default: 'Software Engineer' },
    upvotes: { type: Number, default: 1 },
    upvotedBy: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['open', 'matched'],
      default: 'open',
    },
    matchedMentorName: { type: String, default: '' },
    matchedMentorEmail: { type: String, default: '' },
    matchedAt: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Wishlist = mongoose.model('Wishlist', wishlistSchema);
