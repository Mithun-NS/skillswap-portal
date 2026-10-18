import express from 'express';
import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { User } from '../models/User.js';
import { isMongoConnected, readLocalDB, writeLocalDB } from '../config/db.js';

const router = express.Router();

// GET all bookings
router.get('/', async (req, res) => {
  try {
    if (isMongoConnected) {
      const bookings = await Booking.find().sort({ createdAt: -1 }).lean();
      return res.json(bookings);
    }
    const db = readLocalDB();
    return res.json(db.bookings || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create booking
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) {
      data.id = `bkg_${Date.now()}`;
    }
    data.status = data.status || 'confirmed';
    data.createdAt = data.createdAt || new Date().toISOString();
    data.date = data.date || new Date().toISOString().split('T')[0];
    data.meetUrl = data.meetingUrl || data.meetUrl || 'https://meet.google.com/new';
    data.menteeEmail = data.menteeEmail || 'colleague@intimetec.com';
    data.mentorEmail = data.mentorEmail || '';
    data.mentorRole = data.mentorRole || '';

    if (isMongoConnected) {
      const newBooking = await Booking.create(data);

      // Flag mentor's slot as booked in MongoDB (robust matching by ID, _id, or email, and slotId or day/time)
      try {
        const isObjectId = mongoose.Types.ObjectId.isValid(data.mentorId);
        const mentorDoc = await User.findOne({
          $or: [
            ...(data.mentorId ? [{ id: data.mentorId }] : []),
            ...(isObjectId ? [{ _id: data.mentorId }] : []),
            ...(data.mentorEmail ? [{ email: data.mentorEmail.toLowerCase() }] : []),
          ]
        });

        if (mentorDoc && Array.isArray(mentorDoc.availableSlots)) {
          let updated = false;
          mentorDoc.availableSlots.forEach((slot) => {
            const matchId = data.slotId && (slot.id === data.slotId || String(slot._id) === String(data.slotId));
            const matchDayTime = slot.day?.toLowerCase() === data.day?.toLowerCase() && slot.time === data.time;
            if (matchId || matchDayTime) {
              slot.isBooked = true;
              updated = true;
            }
          });
          if (updated) {
            mentorDoc.markModified('availableSlots');
            await mentorDoc.save();
            console.log(`[Booking] Slot marked isBooked: true in MongoDB for mentor: ${mentorDoc.name} (${data.day} ${data.time})`);
          }
        }
      } catch (flagErr) {
        console.warn('[Booking] Could not flag slot in Mongo:', flagErr.message);
      }

      return res.status(201).json(newBooking);
    }

    const db = readLocalDB();
    db.bookings = db.bookings || [];
    db.bookings.unshift(data);

    // Flag mentor slot in local DB
    if (db.users) {
      const mentor = db.users.find((u) =>
        (data.mentorId && (u.id === data.mentorId || u._id === data.mentorId)) ||
        (data.mentorEmail && u.email?.toLowerCase() === data.mentorEmail.toLowerCase())
      );
      if (mentor && mentor.availableSlots) {
        mentor.availableSlots.forEach((s) => {
          const matchId = data.slotId && (s.id === data.slotId || s._id === data.slotId);
          const matchDayTime = s.day?.toLowerCase() === data.day?.toLowerCase() && s.time === data.time;
          if (matchId || matchDayTime) {
            s.isBooked = true;
          }
        });
      }
    }

    writeLocalDB(db);
    return res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT cancel booking
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (isMongoConnected) {
      const booking = await Booking.findOne({ id });
      if (!booking) return res.status(404).json({ error: 'Booking not found' });

      booking.status = 'cancelled';
      booking.cancelReason = reason || '';
      await booking.save();

      // Free up slot in Mongo
      if (booking.mentorId) {
        try {
          const isObjectId = mongoose.Types.ObjectId.isValid(booking.mentorId);
          const mentorDoc = await User.findOne({
            $or: [
              ...(booking.mentorId ? [{ id: booking.mentorId }] : []),
              ...(isObjectId ? [{ _id: booking.mentorId }] : []),
              ...(booking.mentorEmail ? [{ email: booking.mentorEmail.toLowerCase() }] : [])
            ]
          });
          if (mentorDoc && Array.isArray(mentorDoc.availableSlots)) {
            mentorDoc.availableSlots.forEach((slot) => {
              const matchId = booking.slotId && (slot.id === booking.slotId || String(slot._id) === String(booking.slotId));
              const matchDayTime = slot.day?.toLowerCase() === booking.day?.toLowerCase() && slot.time === booking.time;
              if (matchId || matchDayTime) {
                slot.isBooked = false;
              }
            });
            mentorDoc.markModified('availableSlots');
            await mentorDoc.save();
          }
        } catch (unbookErr) {
          console.warn('[Booking] Could not unbook slot in Mongo:', unbookErr.message);
        }
      }

      return res.json({ success: true, booking });
    }

    const db = readLocalDB();
    db.bookings = db.bookings || [];
    const b = db.bookings.find((item) => item.id === id);
    if (!b) return res.status(404).json({ error: 'Booking not found' });

    b.status = 'cancelled';
    b.cancelReason = reason || '';

    if (b.mentorId && b.slotId && db.users) {
      const mentor = db.users.find((u) => u.id === b.mentorId);
      if (mentor && mentor.availableSlots) {
        mentor.availableSlots = mentor.availableSlots.map((s) =>
          s.id === b.slotId ? { ...s, isBooked: false } : s
        );
      }
    }

    writeLocalDB(db);
    return res.json({ success: true, booking: b });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT mark booking complete
router.put('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { feedbackNote } = req.body;

    if (isMongoConnected) {
      const booking = await Booking.findOne({ id });
      if (!booking) return res.status(404).json({ error: 'Booking not found' });

      booking.status = 'completed';
      booking.feedbackNote = feedbackNote || '';
      booking.completedAt = new Date().toISOString();
      await booking.save();

      return res.json({ success: true, booking });
    }

    const db = readLocalDB();
    db.bookings = db.bookings || [];
    const b = db.bookings.find((item) => item.id === id);
    if (!b) return res.status(404).json({ error: 'Booking not found' });

    b.status = 'completed';
    b.feedbackNote = feedbackNote || '';
    b.completedAt = new Date().toISOString();

    writeLocalDB(db);
    return res.json({ success: true, booking: b });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
