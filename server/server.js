import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, isMongoConnected, readLocalDB, writeLocalDB } from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import talkRoutes from './routes/talkRoutes.js';
import authRoutes from './routes/authRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { User } from './models/User.js';
import { Talk } from './models/Talk.js';
import { Booking } from './models/Booking.js';
import { INITIAL_USERS, INITIAL_TALKS, INITIAL_BOOKINGS } from '../src/utils/storage.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/talks', talkRoutes);
app.use('/api/notifications', notificationRoutes);

// Database Health & Status Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database: isMongoConnected ? 'MongoDB' : 'Local Persistent Store (Disk)',
    timestamp: new Date().toISOString(),
  });
});

// Auto-seed function to ensure the database starts populated with realistic engineers
async function autoSeed() {
  try {
    if (isMongoConnected) {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('[SkillSwap Server] Database is empty. Seeding initial colleagues & talks into MongoDB...');
        await User.insertMany(INITIAL_USERS);
        await Talk.insertMany(INITIAL_TALKS);
        await Booking.insertMany(INITIAL_BOOKINGS);
        console.log('[SkillSwap Server] MongoDB seeding completed successfully.');
      }
    } else {
      const db = readLocalDB();
      if (!db.users || db.users.length === 0) {
        console.log('[SkillSwap Server] Seeding initial colleagues & talks into Local Disk DB...');
        db.users = INITIAL_USERS;
        db.talks = INITIAL_TALKS;
        db.bookings = INITIAL_BOOKINGS;
        writeLocalDB(db);
        console.log('[SkillSwap Server] Local DB seeding completed.');
      }
    }
  } catch (err) {
    console.error('[SkillSwap Server] Auto-seed note:', err.message);
  }
}

// Start Server
async function start() {
  await connectDB();
  await autoSeed();

  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 SkillSwap REST API Server running on port ${PORT}`);
    console.log(`📊 DB Mode: ${isMongoConnected ? 'MongoDB Connected' : 'Local Disk DB Fallback Active'}`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    console.log(`======================================================\n`);
  });
}

start();
