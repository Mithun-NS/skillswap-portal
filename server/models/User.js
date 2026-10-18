import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
  id: { type: String, required: true },
  day: { type: String, required: true },
  time: { type: String, required: true },
  isBooked: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, required: true },
    department: { type: String, required: true },
    experienceYears: { type: Number, default: 1 },
    bio: { type: String, default: '' },
    avatarColor: { type: String, default: 'from-amber-500 to-orange-600' },
    skillsToTeach: [{ type: String }],
    skillsToLearn: [{ type: String }],
    weeklySessionCap: { type: Number, default: 2 },
    availableSlots: [slotSchema],
    joinedAt: { type: String, default: () => new Date().toISOString().split('T')[0] },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
