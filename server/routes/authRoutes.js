import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { isMongoConnected, readLocalDB, writeLocalDB } from '../config/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'skillswap_fallback_secret_key_2026';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department, role } = req.body;

    if (!name || !email || !password || !department || !role) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    // Check if user already exists
    if (isMongoConnected) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(400).json({ error: 'An employee with this email is already registered.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        id: `usr_${Date.now()}`,
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        department: department.trim(),
        role: role.trim(),
        experienceYears: 2,
        bio: `Software professional in ${department}. Passionate about technical pairing and learning.`,
        avatarColor: 'from-amber-500 to-orange-600',
        skillsToTeach: [],
        skillsToLearn: [],
        weeklySessionCap: 2,
        availableSlots: [
          { id: `slot_${Date.now()}_1`, day: 'Thursday', time: '04:00 PM - 04:30 PM', isBooked: false },
          { id: `slot_${Date.now()}_2`, day: 'Friday', time: '03:00 PM - 03:30 PM', isBooked: false }
        ]
      });

      const token = generateToken(newUser);
      const userObj = newUser.toObject();
      delete userObj.password;

      return res.status(201).json({ token, user: userObj });
    }

    // Local DB fallback
    const db = readLocalDB();
    db.users = db.users || [];
    const existing = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'An employee with this email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      department: department.trim(),
      role: role.trim(),
      experienceYears: 2,
      bio: `Software professional in ${department}. Passionate about technical pairing and learning.`,
      avatarColor: 'from-amber-500 to-orange-600',
      skillsToTeach: [],
      skillsToLearn: [],
      weeklySessionCap: 2,
      availableSlots: [
        { id: `slot_${Date.now()}_1`, day: 'Thursday', time: '04:00 PM - 04:30 PM', isBooked: false }
      ],
      joinedAt: new Date().toISOString().split('T')[0]
    };

    db.users.push(newUser);
    writeLocalDB(db);

    const token = generateToken(newUser);
    const userSafe = { ...newUser };
    delete userSafe.password;

    return res.status(201).json({ token, user: userSafe });
  } catch (err) {
    console.error('[Auth Register Error]:', err);
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    let user;
    if (isMongoConnected) {
      user = await User.findOne({ email: cleanEmail }).select('+password');
    } else {
      const db = readLocalDB();
      user = (db.users || []).find((u) => u.email.toLowerCase() === cleanEmail);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email. No account found with this email address.' });
    }

    // If user has a hashed password, compare with bcrypt. If sample user without password, allow test login.
    let isMatch = true;
    if (user.password) {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password.' });
    }

    const token = generateToken(user);
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;

    return res.json({ token, user: userObj });
  } catch (err) {
    console.error('[Auth Login Error]:', err);
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    let user;
    if (isMongoConnected) {
      user = await User.findOne({ id: decoded.id }).lean();
    } else {
      const db = readLocalDB();
      user = (db.users || []).find((u) => u.id === decoded.id);
    }

    if (!user) {
      return res.status(404).json({ error: 'User session not found' });
    }

    delete user.password;
    return res.json(user);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// POST /api/auth/clean-dummy-users (Keeps registered real users and deletes sample mentors)
router.post('/clean-dummy-users', async (req, res) => {
  try {
    const dummyIds = ['usr_01', 'usr_02', 'usr_03', 'usr_04', 'usr_05', 'usr_06'];
    if (isMongoConnected) {
      const result = await User.deleteMany({ id: { $in: dummyIds } });
      return res.json({ success: true, removedCount: result.deletedCount });
    } else {
      const db = readLocalDB();
      db.users = (db.users || []).filter((u) => !dummyIds.includes(u.id));
      writeLocalDB(db);
      return res.json({ success: true, remaining: db.users.length });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
