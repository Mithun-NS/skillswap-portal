import express from 'express';
import { User } from '../models/User.js';
import { isMongoConnected, readLocalDB, writeLocalDB } from '../config/db.js';

const router = express.Router();

// GET all users
router.get('/', async (req, res) => {
  try {
    if (isMongoConnected) {
      const users = await User.find().lean();
      return res.json(users);
    }
    const db = readLocalDB();
    return res.json(db.users || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET user by id or email
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      const user = await User.findOne({ $or: [{ id }, { email: id }] }).lean();
      return user ? res.json(user) : res.status(404).json({ error: 'User not found' });
    }
    const db = readLocalDB();
    const user = (db.users || []).find((u) => u.id === id || u.email === id);
    return user ? res.json(user) : res.status(404).json({ error: 'User not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / PUT upsert user
router.post('/', async (req, res) => {
  try {
    const userData = req.body;
    if (!userData.id) {
      userData.id = `usr_${Date.now()}`;
    }

    if (isMongoConnected) {
      const updated = await User.findOneAndUpdate(
        { $or: [{ id: userData.id }, { email: userData.email }] },
        userData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return res.status(201).json(updated);
    }

    const db = readLocalDB();
    db.users = db.users || [];
    const idx = db.users.findIndex((u) => u.id === userData.id || u.email === userData.email);
    if (idx >= 0) {
      db.users[idx] = { ...db.users[idx], ...userData };
    } else {
      db.users.push(userData);
    }
    writeLocalDB(db);
    return res.status(201).json(userData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST seed initial users
router.post('/seed', async (req, res) => {
  try {
    const seedUsers = req.body.users;
    if (!Array.isArray(seedUsers)) {
      return res.status(400).json({ error: 'Invalid users array' });
    }

    if (isMongoConnected) {
      for (const u of seedUsers) {
        await User.findOneAndUpdate({ id: u.id }, u, { upsert: true, new: true });
      }
      const all = await User.find().lean();
      return res.json({ count: all.length, users: all });
    }

    const db = readLocalDB();
    db.users = seedUsers;
    writeLocalDB(db);
    return res.json({ count: seedUsers.length, users: seedUsers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
