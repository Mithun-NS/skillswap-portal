import express from 'express';
import { Notification } from '../models/Notification.js';
import { isMongoConnected, readLocalDB, writeLocalDB } from '../config/db.js';

const router = express.Router();

/**
 * Helper to dispatch a notification into MongoDB or local store
 */
export async function createNotification(notifData) {
  try {
    const data = {
      id: notifData.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId: notifData.userId || '',
      userEmail: (notifData.userEmail || '').trim().toLowerCase(),
      type: notifData.type || 'system',
      title: notifData.title || 'New Notification',
      message: notifData.message || '',
      link: notifData.link || '/bookings',
      read: false,
      metadata: notifData.metadata || {},
      createdAt: new Date().toISOString(),
    };

    if (!data.userEmail) return null;

    if (isMongoConnected) {
      return await Notification.create(data);
    }

    const db = readLocalDB();
    db.notifications = db.notifications || [];
    db.notifications.unshift(data);
    writeLocalDB(db);
    return data;
  } catch (err) {
    console.error('[Notification Service] Error creating notification:', err.message);
    return null;
  }
}

// GET all notifications for a user (query by ?email=...)
router.get('/', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'email query parameter is required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (isMongoConnected) {
      const list = await Notification.find({ userEmail: cleanEmail })
        .sort({ createdAt: -1 })
        .limit(30)
        .lean();
      return res.json(list);
    }

    const db = readLocalDB();
    db.notifications = db.notifications || [];
    const list = db.notifications
      .filter((n) => (n.userEmail || '').toLowerCase() === cleanEmail)
      .slice(0, 30);
    return res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications - create a notification
router.post('/', async (req, res) => {
  try {
    const notif = await createNotification(req.body);
    if (!notif) {
      return res.status(400).json({ error: 'Failed to create notification. userEmail is required.' });
    }
    return res.status(201).json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/:id/read - mark single notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected) {
      const updated = await Notification.findOneAndUpdate({ id }, { read: true }, { new: true });
      if (!updated) return res.status(404).json({ error: 'Notification not found' });
      return res.json(updated);
    }

    const db = readLocalDB();
    db.notifications = db.notifications || [];
    const item = db.notifications.find((n) => n.id === id);
    if (!item) return res.status(404).json({ error: 'Notification not found' });
    item.read = true;
    writeLocalDB(db);
    return res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/mark-all-read - mark all as read for user
router.put('/mark-all-read', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (isMongoConnected) {
      await Notification.updateMany({ userEmail: cleanEmail, read: false }, { read: true });
      return res.json({ success: true, message: 'All notifications marked as read' });
    }

    const db = readLocalDB();
    db.notifications = db.notifications || [];
    db.notifications.forEach((n) => {
      if ((n.userEmail || '').toLowerCase() === cleanEmail) {
        n.read = true;
      }
    });
    writeLocalDB(db);
    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/notifications/:id - dismiss notification
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected) {
      await Notification.findOneAndDelete({ id });
      return res.json({ success: true, message: 'Notification dismissed' });
    }

    const db = readLocalDB();
    db.notifications = db.notifications || [];
    db.notifications = db.notifications.filter((n) => n.id !== id);
    writeLocalDB(db);
    return res.json({ success: true, message: 'Notification dismissed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
