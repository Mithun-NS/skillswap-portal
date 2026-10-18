import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    mentorId: { type: String, required: true },
    mentorName: { type: String, required: true },
    mentorEmail: { type: String, default: '' },
    mentorRole: { type: String, default: '' },
    menteeId: { type: String, required: true },
    menteeName: { type: String, required: true },
    menteeEmail: { type: String, default: '' },
    slotId: { type: String, required: true },
    day: { type: String, required: true },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    time: { type: String, required: true },
    topic: { type: String, required: true },
    notes: { type: String, default: '' },
    prUrl: { type: String, default: '' },
    meetUrl: { type: String, default: 'https://meet.google.com/new' },
    status: {
      type: String,
      enum: ['confirmed', 'completed', 'cancelled'],
      default: 'confirmed',
    },
    cancelReason: { type: String, default: '' },
    feedbackNote: { type: String, default: '' },
    completedAt: { type: String },
  },
  { timestamps: true }
);

export const Booking = mongoose.model('Booking', bookingSchema);
