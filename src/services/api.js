/**
 * SkillSwap API Client Service
 * Communicates with the Express + MongoDB backend via /api endpoints
 * with JWT authentication and optimistic localStorage caching.
 */
import { storage } from '../utils/storage';

const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('skillswap_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJSON(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `API error: ${res.statusText}`);
    }
    return data;
  } catch (err) {
    console.warn(`[API] Request failed for "${url}":`, err.message);
    throw err;
  }
}

export const api = {
  // Check backend & database status
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch {
      return { status: 'offline', database: 'Local Fallback' };
    }
  },

  // AUTH
  async register(userData) {
    return await fetchJSON(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async login(credentials) {
    return await fetchJSON(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async getMe() {
    return await fetchJSON(`${API_BASE}/auth/me`);
  },

  async cleanDummyUsers() {
    return await fetchJSON(`${API_BASE}/auth/clean-dummy-users`, {
      method: 'POST',
    });
  },

  // USERS
  async getUsers() {
    try {
      const data = await fetchJSON(`${API_BASE}/users`);
      if (Array.isArray(data) && data.length > 0) {
        storage.saveUsers(data);
        return data;
      }
      return storage.getUsers();
    } catch {
      return storage.getUsers();
    }
  },

  async getUserById(id) {
    try {
      return await fetchJSON(`${API_BASE}/users/${id}`);
    } catch {
      return storage.getUserById(id);
    }
  },

  async saveUser(user) {
    storage.upsertUser(user);
    try {
      return await fetchJSON(`${API_BASE}/users`, {
        method: 'POST',
        body: JSON.stringify(user),
      });
    } catch {
      return user;
    }
  },

  // BOOKINGS
  async getBookings() {
    try {
      const data = await fetchJSON(`${API_BASE}/bookings`);
      if (Array.isArray(data)) {
        storage.saveBookings(data);
        return data;
      }
      return storage.getBookings();
    } catch {
      return storage.getBookings();
    }
  },

  async createBooking(bookingData) {
    const local = storage.createBooking(bookingData);
    try {
      return await fetchJSON(`${API_BASE}/bookings`, {
        method: 'POST',
        body: JSON.stringify(local),
      });
    } catch {
      return local;
    }
  },

  async cancelBooking(bookingId, reason = '') {
    storage.cancelBooking(bookingId, reason);
    try {
      return await fetchJSON(`${API_BASE}/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        body: JSON.stringify({ reason }),
      });
    } catch {
      return { success: true };
    }
  },

  async completeBooking(bookingId, feedbackNote = '') {
    storage.completeBooking(bookingId, feedbackNote);
    try {
      return await fetchJSON(`${API_BASE}/bookings/${bookingId}/complete`, {
        method: 'PUT',
        body: JSON.stringify({ feedbackNote }),
      });
    } catch {
      return { success: true };
    }
  },

  // TALKS
  async getTalks() {
    try {
      const data = await fetchJSON(`${API_BASE}/talks`);
      if (Array.isArray(data)) {
        storage.saveTalks(data);
        return data;
      }
      return storage.getTalks();
    } catch {
      return storage.getTalks();
    }
  },

  async addTalk(talkData) {
    const local = storage.addTalk(talkData);
    try {
      return await fetchJSON(`${API_BASE}/talks`, {
        method: 'POST',
        body: JSON.stringify(local),
      });
    } catch {
      return local;
    }
  },

  async toggleTalkRsvp(talkId, userEmail) {
    const localResult = storage.toggleTalkRsvp(talkId, userEmail);
    try {
      await fetchJSON(`${API_BASE}/talks/${talkId}/rsvp`, {
        method: 'POST',
        body: JSON.stringify({ userEmail }),
      });
    } catch {
      // offline fallback handled
    }
    return localResult;
  },

  async deleteTalk(talkId) {
    storage.deleteTalk(talkId);
    try {
      return await fetchJSON(`${API_BASE}/talks/${talkId}`, {
        method: 'DELETE',
      });
    } catch {
      return { success: true };
    }
  },
};
