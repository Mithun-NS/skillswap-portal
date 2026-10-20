import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, default: '' },
    userEmail: { type: String, required: true, lowercase: true, trim: true },
    type: {
      type: String,
      default: 'system',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: '/bookings' },
    read: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const Notification = mongoose.model('Notification', notificationSchema);
