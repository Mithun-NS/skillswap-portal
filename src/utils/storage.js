/**
 * SkillSwap Global Storage Engine
 * Manages localStorage persistence for users, bookings, talks, and active session profile.
 */

const KEYS = {
  USERS: 'skillswap_users',
  BOOKINGS: 'skillswap_bookings',
  TALKS: 'skillswap_talks',
  CURRENT_USER: 'skillswap_current_user',
};

// Initial Seed Data with genuine-sounding engineering colleagues
export const INITIAL_USERS = [
  {
    id: 'usr_01',
    name: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    role: 'Staff Frontend Architect',
    department: 'Frontend Infra',
    experienceYears: 8,
    bio: 'Focused on design systems, React 19 migrations, and web performance optimization. Happy to review complex UI state logic or architectural trade-offs.',
    avatarColor: 'from-blue-500 to-indigo-600',
    skillsToTeach: ['React.js', 'TypeScript', 'Next.js', 'Design Systems', 'Web Performance'],
    skillsToLearn: ['Rust', 'WebAssembly', 'Go'],
    weeklySessionCap: 2,
    availableSlots: [
      { id: 'slot_1_1', day: 'Tuesday', time: '04:00 PM - 04:30 PM', isBooked: false },
      { id: 'slot_1_2', day: 'Tuesday', time: '04:30 PM - 05:00 PM', isBooked: false },
      { id: 'slot_1_3', day: 'Thursday', time: '03:30 PM - 04:00 PM', isBooked: false },
      { id: 'slot_1_4', day: 'Thursday', time: '04:00 PM - 04:30 PM', isBooked: false }
    ],
    joinedAt: '2024-01-15'
  },
  {
    id: 'usr_02',
    name: 'Marcus Vance',
    email: 'marcus.vance@company.com',
    role: 'Senior Backend Engineer',
    department: 'Billing & Payments',
    experienceYears: 6,
    bio: 'Distributed transactions, idempotent payment pipelines, and high-throughput MongoDB & PostgreSQL indexing. Let us pair on your API design or query bottlenecks.',
    avatarColor: 'from-emerald-500 to-teal-600',
    skillsToTeach: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'System Design', 'Redis'],
    skillsToLearn: ['Kubernetes', 'Terraform', 'Kafka'],
    weeklySessionCap: 3,
    availableSlots: [
      { id: 'slot_2_1', day: 'Wednesday', time: '02:00 PM - 02:30 PM', isBooked: false },
      { id: 'slot_2_2', day: 'Wednesday', time: '02:30 PM - 03:00 PM', isBooked: false },
      { id: 'slot_2_3', day: 'Friday', time: '11:00 AM - 11:30 AM', isBooked: false }
    ],
    joinedAt: '2024-02-10'
  },
  {
    id: 'usr_03',
    name: 'Priya Sharma',
    email: 'priya.sharma@company.com',
    role: 'Lead DevOps & Cloud Engineer',
    department: 'Platform & SRE',
    experienceYears: 7,
    bio: 'Kubernetes cluster operations, Docker containerization, AWS cost optimization, and CI/CD hardening with GitHub Actions. Reach out for container pairing.',
    avatarColor: 'from-amber-500 to-orange-600',
    skillsToTeach: ['Docker', 'Kubernetes', 'AWS', 'GitHub Actions', 'Terraform', 'Linux'],
    skillsToLearn: ['Go', 'eBPF', 'Prometheus'],
    weeklySessionCap: 2,
    availableSlots: [
      { id: 'slot_3_1', day: 'Monday', time: '05:00 PM - 05:30 PM', isBooked: false },
      { id: 'slot_3_2', day: 'Thursday', time: '05:00 PM - 05:30 PM', isBooked: false }
    ],
    joinedAt: '2023-11-20'
  },
  {
    id: 'usr_04',
    name: 'David Rodriguez',
    email: 'david.rodriguez@company.com',
    role: 'Full Stack Engineer',
    department: 'Core Growth',
    experienceYears: 4,
    bio: 'Transitioned from legacy PHP monolith to MERN stack last year. I can share the exact pitfalls and smooth path for modern full-stack setups.',
    avatarColor: 'from-violet-500 to-purple-600',
    skillsToTeach: ['MERN Stack', 'React.js', 'Node.js', 'PHP', 'Tailwind CSS', 'REST APIs'],
    skillsToLearn: ['GraphQL', 'System Design', 'Docker'],
    weeklySessionCap: 2,
    availableSlots: [
      { id: 'slot_4_1', day: 'Tuesday', time: '03:00 PM - 03:30 PM', isBooked: false },
      { id: 'slot_4_2', day: 'Friday', time: '04:00 PM - 04:30 PM', isBooked: false }
    ],
    joinedAt: '2024-03-01'
  },
  {
    id: 'usr_05',
    name: 'Elena Rostova',
    email: 'elena.rostova@company.com',
    role: 'Staff QA Automation Architect',
    department: 'Quality Engineering',
    experienceYears: 9,
    bio: 'E2E testing with Playwright, Cypress component testing, performance testing with k6, and test flakiness mitigation. Happy to pair on PR automation.',
    avatarColor: 'from-rose-500 to-pink-600',
    skillsToTeach: ['Playwright', 'Cypress', 'Jest', 'CI/CD Testing', 'QA Strategy'],
    skillsToLearn: ['AI Test Agents', 'TypeScript', 'Docker'],
    weeklySessionCap: 2,
    availableSlots: [
      { id: 'slot_5_1', day: 'Wednesday', time: '04:00 PM - 04:30 PM', isBooked: false },
      { id: 'slot_5_2', day: 'Friday', time: '02:00 PM - 02:30 PM', isBooked: false }
    ],
    joinedAt: '2023-09-12'
  },
  {
    id: 'usr_06',
    name: 'Kofi Mensah',
    email: 'kofi.mensah@company.com',
    role: 'Principal Security & Auth Engineer',
    department: 'Security & Compliance',
    experienceYears: 10,
    bio: 'OAuth 2.0, OpenID Connect, JWT lifecycle, secure API design, and vulnerability triage. Let us review your auth flows or token verification architecture.',
    avatarColor: 'from-cyan-500 to-blue-600',
    skillsToTeach: ['OAuth 2.0', 'JWT', 'Security Auditing', 'Go', 'API Security'],
    skillsToLearn: ['Zero Trust Architecture', 'Cloudflare Workers'],
    weeklySessionCap: 2,
    availableSlots: [
      { id: 'slot_6_1', day: 'Thursday', time: '02:00 PM - 02:30 PM', isBooked: false }
    ],
    joinedAt: '2023-08-01'
  }
];

export const INITIAL_TALKS = [];

export const DEFAULT_CURRENT_USER = {
  id: 'usr_me',
  name: 'Alex Morgan',
  email: 'alex.morgan@company.com',
  role: 'Full Stack Engineer',
  department: 'Cloud Platform',
  experienceYears: 4,
  bio: 'Building developer tooling and internal productivity platforms. Passionate about MERN stack transitions, clean REST/GraphQL APIs, and DX.',
  avatarColor: 'from-indigo-500 to-purple-600',
  skillsToTeach: ['React.js', 'Node.js', 'Docker', 'GraphQL'],
  skillsToLearn: ['Kubernetes', 'Rust', 'System Design'],
  weeklySessionCap: 2,
  availableSlots: [
    { id: 'slot_me_1', day: 'Thursday', time: '04:00 PM - 04:30 PM', isBooked: false },
    { id: 'slot_me_2', day: 'Friday', time: '03:00 PM - 03:30 PM', isBooked: false }
  ],
  joinedAt: '2024-04-01'
};

export const INITIAL_BOOKINGS = [];

// Helper to safely get from localStorage
function safeGet(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`[SkillSwap Storage] Error reading key "${key}":`, error);
    return fallback;
  }
}

// Helper to safely set in localStorage
function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Dispatch a custom event so other components can react
    window.dispatchEvent(new CustomEvent('skillswap:storage_change', { detail: { key } }));
    return true;
  } catch (error) {
    console.error(`[SkillSwap Storage] Error setting key "${key}":`, error);
    return false;
  }
}

/**
 * Storage API
 */
export const storage = {
  // --- USERS ---
  getUsers() {
    let users = safeGet(KEYS.USERS, null);
    if (!users || !Array.isArray(users) || users.length === 0) {
      safeSet(KEYS.USERS, INITIAL_USERS);
      users = INITIAL_USERS;
    }
    return users;
  },

  saveUsers(users) {
    return safeSet(KEYS.USERS, users);
  },

  getUserById(id) {
    const users = this.getUsers();
    return users.find((u) => u.id === id) || null;
  },

  upsertUser(user) {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === user.id || u.email === user.email);
    if (index >= 0) {
      users[index] = { ...users[index], ...user };
    } else {
      users.push(user);
    }
    this.saveUsers(users);
    return user;
  },

  // --- CURRENT LOGGED IN USER ---
  getCurrentUser() {
    let user = safeGet(KEYS.CURRENT_USER, null);
    if (!user) {
      safeSet(KEYS.CURRENT_USER, DEFAULT_CURRENT_USER);
      user = DEFAULT_CURRENT_USER;
      // also ensure user is in the public directory list
      this.upsertUser(user);
    }
    return user;
  },

  setCurrentUser(user) {
    safeSet(KEYS.CURRENT_USER, user);
    // synchronize back to general users list
    this.upsertUser(user);
    return user;
  },

  // --- BOOKINGS ---
  getBookings() {
    let bookings = safeGet(KEYS.BOOKINGS, null);
    if (!bookings || !Array.isArray(bookings)) {
      safeSet(KEYS.BOOKINGS, INITIAL_BOOKINGS);
      bookings = INITIAL_BOOKINGS;
    }
    return bookings;
  },

  saveBookings(bookings) {
    return safeSet(KEYS.BOOKINGS, bookings);
  },

  createBooking(bookingData) {
    const bookings = this.getBookings();
    const newBooking = {
      id: `bkg_${Date.now()}`,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      feedbackNote: '',
      ...bookingData
    };

    bookings.unshift(newBooking);
    this.saveBookings(bookings);

    // Mark the mentor's slot as booked
    if (newBooking.mentorId && newBooking.slotId) {
      const users = this.getUsers();
      const mentor = users.find((u) => u.id === newBooking.mentorId);
      if (mentor && mentor.availableSlots) {
        mentor.availableSlots = mentor.availableSlots.map((slot) =>
          slot.id === newBooking.slotId ? { ...slot, isBooked: true } : slot
        );
        this.saveUsers(users);
      }
    }

    return newBooking;
  },

  cancelBooking(bookingId, reason = '') {
    const bookings = this.getBookings();
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return false;

    booking.status = 'cancelled';
    booking.cancelReason = reason;
    this.saveBookings(bookings);

    // Free up the mentor's slot
    if (booking.mentorId && booking.slotId) {
      const users = this.getUsers();
      const mentor = users.find((u) => u.id === booking.mentorId);
      if (mentor && mentor.availableSlots) {
        mentor.availableSlots = mentor.availableSlots.map((slot) =>
          slot.id === booking.slotId ? { ...slot, isBooked: false } : slot
        );
        this.saveUsers(users);
      }
    }

    return true;
  },

  completeBooking(bookingId, feedbackNote = '') {
    const bookings = this.getBookings();
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return false;

    booking.status = 'completed';
    booking.feedbackNote = feedbackNote;
    booking.completedAt = new Date().toISOString();
    this.saveBookings(bookings);
    return true;
  },

  // --- TECH TALKS ---
  getTalks() {
    let talks = safeGet(KEYS.TALKS, null);
    if (!talks || !Array.isArray(talks)) {
      safeSet(KEYS.TALKS, INITIAL_TALKS);
      talks = INITIAL_TALKS;
    }
    return talks;
  },

  saveTalks(talks) {
    return safeSet(KEYS.TALKS, talks);
  },

  addTalk(talkData) {
    const talks = this.getTalks();
    const newTalk = {
      id: `talk_${Date.now()}`,
      attendees: [],
      createdAt: new Date().toISOString().split('T')[0],
      ...talkData
    };
    talks.unshift(newTalk);
    this.saveTalks(talks);
    return newTalk;
  },

  toggleTalkRsvp(talkId, userEmail) {
    const talks = this.getTalks();
    const talk = talks.find((t) => t.id === talkId);
    if (!talk) return false;

    if (!talk.attendees) talk.attendees = [];

    const isAttending = talk.attendees.includes(userEmail);
    if (isAttending) {
      talk.attendees = talk.attendees.filter((email) => email !== userEmail);
    } else {
      talk.attendees.push(userEmail);
    }

    this.saveTalks(talks);
    return !isAttending; // returns true if now attending, false if removed
  },

  deleteTalk(talkId) {
    const talks = this.getTalks();
    const filtered = talks.filter((t) => t.id !== talkId);
    this.saveTalks(filtered);
    return true;
  },

  // --- BACKUP & RESTORE / TEAM SHARING ---
  exportDatabase() {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      users: this.getUsers(),
      talks: this.getTalks(),
      bookings: this.getBookings(),
    };
    return JSON.stringify(data, null, 2);
  },

  importDatabase(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.users || !Array.isArray(parsed.users)) {
        throw new Error('Invalid format: missing users list');
      }

      if (parsed.users) safeSet(KEYS.USERS, parsed.users);
      if (parsed.talks) safeSet(KEYS.TALKS, parsed.talks);
      if (parsed.bookings) safeSet(KEYS.BOOKINGS, parsed.bookings);

      return { success: true, userCount: parsed.users.length };
    } catch (err) {
      console.error('[SkillSwap Import] Failed:', err);
      return { success: false, error: err.message };
    }
  },

  resetAll() {
    safeSet(KEYS.USERS, INITIAL_USERS);
    safeSet(KEYS.TALKS, INITIAL_TALKS);
    safeSet(KEYS.BOOKINGS, INITIAL_BOOKINGS);
    safeSet(KEYS.CURRENT_USER, DEFAULT_CURRENT_USER);
  }
};
