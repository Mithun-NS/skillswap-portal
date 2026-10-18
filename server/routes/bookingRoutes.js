import express from 'express';
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
    data.status = 'confirmed';
    data.createdAt = new Date().toISOString();

    if (isMongoConnected) {
      const newBooking = await Booking.create(data);

      // Flag mentor's slot as booked in MongoDB
      if (data.mentorId && data.slotId) {
        await User.updateOne(
          { id: data.mentorId, 'availableSlots.id': data.slotId },
          { $set: { 'availableSlots.$.isBooked': true } }
        );
      }

      return res.status(201).json(newBooking);
    }

    const db = readLocalDB();
    db.bookings = db.bookings || [];
    db.bookings.unshift(data);

    // Flag mentor slot in local DB
    if (data.mentorId && data.slotId && db.users) {
      const mentor = db.users.find((u) => u.id === data.mentorId);
      if (mentor && mentor.availableSlots) {
        mentor.availableSlots = mentor.availableSlots.map((s) =>
          s.id === data.slotId ? { ...s, isBooked: true } : s
        );
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

      // Free up slot
      if (booking.mentorId && booking.slotId) {
        await User.updateOne(
          { id: booking.mentorId, 'availableSlots.id': booking.slotId },
          { $set: { 'availableSlots.$.isBooked': false } }
        );
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
