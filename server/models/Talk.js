import mongoose from 'mongoose';

const talkSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    abstract: { type: String, required: true },
    speakerName: { type: String, required: true },
    speakerEmail: { type: String, required: true },
    speakerRole: { type: String, required: true },
    department: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    duration: { type: String, default: '45 mins' },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    meetingUrl: { type: String, default: 'https://meet.google.com/new' },
    slidesUrl: { type: String, default: '' },
    attendees: [{ type: String }],
    createdAt: { type: String, default: () => new Date().toISOString().split('T')[0] },
  },
  { timestamps: true }
);

export const Talk = mongoose.model('Talk', talkSchema);
