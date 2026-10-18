import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export let isMongoConnected = false;

// Fallback disk database path when MongoDB is not running locally
export const LOCAL_DB_PATH = path.join(__dirname, '../data/skillswap-db.json');

export async function connectDB() {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillswap';

  try {
    console.log(`[SkillSwap DB] Attempting connection to MongoDB at: ${mongoURI}`);
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2500, // Quick timeout to fallback if no Mongo daemon is active
    });
    isMongoConnected = true;
    console.log(`[SkillSwap DB] MongoDB Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    isMongoConnected = false;
    console.warn(`[SkillSwap DB] MongoDB connection not active (${err.message}).`);
    console.log(`[SkillSwap DB] 🛡️  Activating Local Persistent Disk Store: ${LOCAL_DB_PATH}`);
    ensureLocalDbFile();
  }
}

export function ensureLocalDbFile() {
  const dir = path.dirname(LOCAL_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify({ users: [], bookings: [], talks: [] }, null, 2));
  }
}

export function readLocalDB() {
  ensureLocalDbFile();
  try {
    const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { users: [], bookings: [], talks: [] };
  }
}

export function writeLocalDB(data) {
  ensureLocalDbFile();
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('[SkillSwap DB] Failed to write local DB:', err);
    return false;
  }
}
