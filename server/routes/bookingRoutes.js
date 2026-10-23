import express from 'express';
import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { User } from '../models/User.js';
import { isMongoConnected, readLocalDB, writeLocalDB } from '../config/db.js';
import { createNotification } from './notificationRoutes.js';

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

function getNextDateForDay(dayName, timeStr) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetIndex = days.findIndex((d) => d.toLowerCase() === (dayName || '').toLowerCase());
  const now = new Date();
  if (targetIndex === -1) {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const result = new Date(now);
  const currentIndex = result.getDay();
  let diff = targetIndex - currentIndex;

  if (diff === 0 && timeStr) {
    try {
      const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const ampm = match[3].toUpperCase();
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        const slotEnd = new Date(now);
        slotEnd.setHours(hours, minutes, 0, 0);
        if (slotEnd <= now) {
          diff = 7; // advance to next week
        }
      }
    } catch (e) {}
  } else if (diff < 0) {
    diff += 7;
  }

  result.setDate(result.getDate() + diff);
  const y = result.getFullYear();
  const m = String(result.getMonth() + 1).padStart(2, '0');
  const d = String(result.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// POST create booking
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) {
      data.id = `bkg_${Date.now()}`;
    }
    data.status = data.status || 'confirmed';
    data.createdAt = data.createdAt || new Date().toISOString();
    data.date = (data.date && /^\d{4}-\d{2}-\d{2}$/.test(data.date))
      ? data.date
      : getNextDateForDay(data.day, data.time);
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

      // Notify mentor of new booking
      try {
        await createNotification({
          userId: data.mentorId,
          userEmail: data.mentorEmail,
          type: 'booking_new',
          title: 'New Session Booked! 📅',
          message: `${data.userName || 'A colleague'} booked a ${data.skill || 'Skill'} session with you on ${data.date || data.day} at ${data.time}.`,
          link: '/my-bookings',
          metadata: { bookingId: data.id, requester: data.userName, skill: data.skill }
        });
      } catch (notifErr) {
        console.warn('[Notification] Failed to create booking notification:', notifErr.message);
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

    // Notify mentor of new booking (local fallback)
    try {
      await createNotification({
        userId: data.mentorId,
        userEmail: data.mentorEmail,
        type: 'booking_new',
        title: 'New Session Booked! 📅',
        message: `${data.userName || 'A colleague'} booked a ${data.skill || 'Skill'} session with you on ${data.date || data.day} at ${data.time}.`,
        link: '/my-bookings',
        metadata: { bookingId: data.id, requester: data.userName, skill: data.skill }
      });
    } catch (_) {}

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

      // Notify parties
      try {
        if (booking.mentorEmail) {
          await createNotification({
            userId: booking.mentorId,
            userEmail: booking.mentorEmail,
            type: 'booking_cancelled',
            title: 'Session Cancelled ⚠️',
            message: `The session for ${booking.skill || 'Skill'} on ${booking.date || booking.day} at ${booking.time} was cancelled.${reason ? ` Reason: ${reason}` : ''}`,
            link: '/my-bookings',
            metadata: { bookingId: booking.id, reason }
          });
        }
        if (booking.userEmail) {
          await createNotification({
            userId: booking.userId,
            userEmail: booking.userEmail,
            type: 'booking_cancelled',
            title: 'Session Cancelled ⚠️',
            message: `The session for ${booking.skill || 'Skill'} on ${booking.date || booking.day} at ${booking.time} was cancelled.${reason ? ` Reason: ${reason}` : ''}`,
            link: '/my-bookings',
            metadata: { bookingId: booking.id, reason }
          });
        }
      } catch (_) {}

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

    // Local notification fallback
    try {
      if (b.mentorEmail) {
        await createNotification({
          userId: b.mentorId,
          userEmail: b.mentorEmail,
          type: 'booking_cancelled',
          title: 'Session Cancelled ⚠️',
          message: `The session for ${b.skill || 'Skill'} on ${b.date || b.day} at ${b.time} was cancelled.${reason ? ` Reason: ${reason}` : ''}`,
          link: '/my-bookings'
        });
      }
      if (b.userEmail) {
        await createNotification({
          userId: b.userId,
          userEmail: b.userEmail,
          type: 'booking_cancelled',
          title: 'Session Cancelled ⚠️',
          message: `The session for ${b.skill || 'Skill'} on ${b.date || b.day} at ${b.time} was cancelled.${reason ? ` Reason: ${reason}` : ''}`,
          link: '/my-bookings'
        });
      }
    } catch (_) {}

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

      // Notify mentee
      try {
        if (booking.userEmail) {
          await createNotification({
            userId: booking.userId,
            userEmail: booking.userEmail,
            type: 'booking_completed',
            title: 'Session Completed! 🎉',
            message: `Your session with ${booking.mentorName || 'your mentor'} for ${booking.skill || 'Skill'} is complete. Check out the feedback!`,
            link: '/my-bookings',
            metadata: { bookingId: booking.id, feedbackNote }
          });
        }
      } catch (_) {}

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

    try {
      if (b.userEmail) {
        await createNotification({
          userId: b.userId,
          userEmail: b.userEmail,
          type: 'booking_completed',
          title: 'Session Completed! 🎉',
          message: `Your session with ${b.mentorName || 'your mentor'} for ${b.skill || 'Skill'} is complete. Check out the feedback!`,
          link: '/my-bookings'
        });
      }
    } catch (_) {}

    return res.json({ success: true, booking: b });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE booking
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      await Booking.deleteOne({
        $or: [
          { id },
          ...(isObjectId ? [{ _id: id }] : [])
        ]
      });
      return res.json({ success: true, message: `Booking ${id} deleted` });
    }
    const db = readLocalDB();
    db.bookings = (db.bookings || []).filter((b) => b.id !== id && b._id !== id);
    writeLocalDB(db);
    return res.json({ success: true, message: `Booking ${id} deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
