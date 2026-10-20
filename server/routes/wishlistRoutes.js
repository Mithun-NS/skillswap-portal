import express from 'express';
import { Wishlist } from '../models/Wishlist.js';
import { isMongoConnected, readLocalDB, writeLocalDB } from '../config/db.js';
import { createNotification } from './notificationRoutes.js';

const router = express.Router();

// GET all wishlist requests
router.get('/', async (req, res) => {
  try {
    if (isMongoConnected) {
      const items = await Wishlist.find().sort({ status: 1, upvotes: -1, createdAt: -1 }).lean();
      return res.json(items);
    }

    const db = readLocalDB();
    db.wishlist = db.wishlist || [];
    const sorted = [...db.wishlist].sort((a, b) => {
      if (a.status !== b.status) return a.status === 'open' ? -1 : 1;
      return (b.upvotes || 0) - (a.upvotes || 0);
    });
    return res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new skill request
router.post('/', async (req, res) => {
  try {
    const { skill, description, requesterName, requesterEmail, requesterRole } = req.body;

    if (!skill || !requesterEmail) {
      return res.status(400).json({ error: 'skill and requesterEmail are required' });
    }

    const cleanEmail = requesterEmail.trim().toLowerCase();
    const data = {
      id: `wish_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      skill: skill.trim(),
      description: (description || '').trim(),
      requesterName: (requesterName || 'Engineer').trim(),
      requesterEmail: cleanEmail,
      requesterRole: (requesterRole || 'Software Engineer').trim(),
      upvotes: 1,
      upvotedBy: [cleanEmail],
      status: 'open',
      matchedMentorName: '',
      matchedMentorEmail: '',
      matchedAt: '',
      createdAt: new Date().toISOString(),
    };

    if (isMongoConnected) {
      const newWish = await Wishlist.create(data);
      return res.status(201).json(newWish);
    }

    const db = readLocalDB();
    db.wishlist = db.wishlist || [];
    db.wishlist.unshift(data);
    writeLocalDB(db);
    return res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT edit wishlist item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { skill, description } = req.body;

    if (!skill || !skill.trim()) {
      return res.status(400).json({ error: 'skill is required' });
    }

    if (isMongoConnected) {
      const wish = await Wishlist.findOne({ id });
      if (!wish) return res.status(404).json({ error: 'Wishlist item not found' });

      wish.skill = skill.trim();
      wish.description = (description || '').trim();
      await wish.save();
      return res.json({ success: true, item: wish });
    }

    const db = readLocalDB();
    db.wishlist = db.wishlist || [];
    const wish = db.wishlist.find((w) => w.id === id);
    if (!wish) return res.status(404).json({ error: 'Wishlist item not found' });

    wish.skill = skill.trim();
    wish.description = (description || '').trim();
    writeLocalDB(db);
    return res.json({ success: true, item: wish });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST toggle upvote (+1 / "I want to learn this too")
router.post('/:id/upvote', async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({ error: 'userEmail is required' });
    }

    const cleanEmail = userEmail.trim().toLowerCase();

    if (isMongoConnected) {
      const wish = await Wishlist.findOne({ id });
      if (!wish) return res.status(404).json({ error: 'Wishlist item not found' });

      wish.upvotedBy = wish.upvotedBy || [];
      const idx = wish.upvotedBy.indexOf(cleanEmail);
      let upvoted = false;

      if (idx >= 0) {
        wish.upvotedBy.splice(idx, 1);
        wish.upvotes = Math.max(1, wish.upvotes - 1);
        upvoted = false;
      } else {
        wish.upvotedBy.push(cleanEmail);
        wish.upvotes = (wish.upvotes || 0) + 1;
        upvoted = true;
      }

      await wish.save();
      return res.json({ upvoted, upvotes: wish.upvotes, upvotedBy: wish.upvotedBy });
    }

    const db = readLocalDB();
    db.wishlist = db.wishlist || [];
    const wish = db.wishlist.find((w) => w.id === id);
    if (!wish) return res.status(404).json({ error: 'Wishlist item not found' });

    wish.upvotedBy = wish.upvotedBy || [];
    const idx = wish.upvotedBy.indexOf(cleanEmail);
    let upvoted = false;

    if (idx >= 0) {
      wish.upvotedBy.splice(idx, 1);
      wish.upvotes = Math.max(1, wish.upvotes - 1);
      upvoted = false;
    } else {
      wish.upvotedBy.push(cleanEmail);
      wish.upvotes = (wish.upvotes || 0) + 1;
      upvoted = true;
    }

    writeLocalDB(db);
    return res.json({ upvoted, upvotes: wish.upvotes, upvotedBy: wish.upvotedBy });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST volunteer to teach ("I can teach this!")
router.post('/:id/volunteer', async (req, res) => {
  try {
    const { id } = req.params;
    const { mentorName, mentorEmail } = req.body;

    if (!mentorEmail) {
      return res.status(400).json({ error: 'mentorEmail is required' });
    }

    const cleanEmail = mentorEmail.trim().toLowerCase();
    const cleanName = (mentorName || 'A colleague').trim();

    if (isMongoConnected) {
      const wish = await Wishlist.findOne({ id });
      if (!wish) return res.status(404).json({ error: 'Wishlist item not found' });

      wish.status = 'matched';
      wish.matchedMentorName = cleanName;
      wish.matchedMentorEmail = cleanEmail;
      wish.matchedAt = new Date().toISOString();
      await wish.save();

      // Trigger notification to the requester!
      try {
        await createNotification({
          userEmail: wish.requesterEmail,
          type: 'booking_new',
          title: `Mentor Found for ${wish.skill}! 🤝`,
          message: `${cleanName} volunteered to mentor you in ${wish.skill}. Check the Wishlist or connect with them!`,
          link: '/',
          metadata: { wishId: wish.id, mentorEmail: cleanEmail, skill: wish.skill }
        });
      } catch (notifErr) {
        console.warn('[Wishlist] Notification failed:', notifErr.message);
      }

      return res.json({ success: true, item: wish });
    }

    const db = readLocalDB();
    db.wishlist = db.wishlist || [];
    const wish = db.wishlist.find((w) => w.id === id);
    if (!wish) return res.status(404).json({ error: 'Wishlist item not found' });

    wish.status = 'matched';
    wish.matchedMentorName = cleanName;
    wish.matchedMentorEmail = cleanEmail;
    wish.matchedAt = new Date().toISOString();

    writeLocalDB(db);

    try {
      await createNotification({
        userEmail: wish.requesterEmail,
        type: 'booking_new',
        title: `Mentor Found for ${wish.skill}! 🤝`,
        message: `${cleanName} volunteered to mentor you in ${wish.skill}. Check the Wishlist or connect with them!`,
        link: '/',
        metadata: { wishId: wish.id, mentorEmail: cleanEmail, skill: wish.skill }
      });
    } catch (_) {}

    return res.json({ success: true, item: wish });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE wishlist item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected) {
      await Wishlist.deleteOne({ id });
      return res.json({ success: true, message: `Wishlist item ${id} deleted` });
    }

    const db = readLocalDB();
    db.wishlist = (db.wishlist || []).filter((w) => w.id !== id);
    writeLocalDB(db);
    return res.json({ success: true, message: `Wishlist item ${id} deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
