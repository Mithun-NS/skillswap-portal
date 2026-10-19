import express from 'express';
import { Talk } from '../models/Talk.js';
import { isMongoConnected, readLocalDB, writeLocalDB } from '../config/db.js';

const router = express.Router();

// GET all talks
router.get('/', async (req, res) => {
  try {
    if (isMongoConnected) {
      const talks = await Talk.find().sort({ date: 1 }).lean();
      return res.json(talks);
    }
    const db = readLocalDB();
    return res.json(db.talks || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add new talk
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) {
      data.id = `talk_${Date.now()}`;
    }
    data.attendees = data.attendees || [];
    data.createdAt = new Date().toISOString().split('T')[0];

    if (isMongoConnected) {
      const newTalk = await Talk.create(data);
      return res.status(201).json(newTalk);
    }

    const db = readLocalDB();
    db.talks = db.talks || [];
    db.talks.unshift(data);
    writeLocalDB(db);
    return res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST toggle RSVP
router.post('/:id/rsvp', async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({ error: 'userEmail is required' });
    }

    if (isMongoConnected) {
      const talk = await Talk.findOne({ id });
      if (!talk) return res.status(404).json({ error: 'Talk not found' });

      const idx = talk.attendees.indexOf(userEmail);
      let isAttending = false;
      if (idx >= 0) {
        talk.attendees.splice(idx, 1);
        isAttending = false;
      } else {
        talk.attendees.push(userEmail);
        isAttending = true;
      }
      await talk.save();
      return res.json({ isAttending, attendees: talk.attendees });
    }

    const db = readLocalDB();
    db.talks = db.talks || [];
    const talk = db.talks.find((t) => t.id === id);
    if (!talk) return res.status(404).json({ error: 'Talk not found' });

    talk.attendees = talk.attendees || [];
    const idx = talk.attendees.indexOf(userEmail);
    let isAttending = false;
    if (idx >= 0) {
      talk.attendees.splice(idx, 1);
      isAttending = false;
    } else {
      talk.attendees.push(userEmail);
      isAttending = true;
    }

    writeLocalDB(db);
    return res.json({ isAttending, attendees: talk.attendees });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE talk
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      const deleted = await Talk.findOneAndDelete({ id });
      if (!deleted) return res.status(404).json({ error: 'Talk not found' });
      return res.json({ success: true, message: 'Talk deleted successfully' });
    }

    const db = readLocalDB();
    db.talks = db.talks || [];
    const prevLen = db.talks.length;
    db.talks = db.talks.filter((t) => t.id !== id);
    if (db.talks.length === prevLen) {
      return res.status(404).json({ error: 'Talk not found' });
    }
    writeLocalDB(db);
    return res.json({ success: true, message: 'Talk deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
