/**
 * Calendar Utilities for SkillSwap
 * Generates and downloads RFC 5545 standard .ics calendar invite files
 * compatible with Outlook, Google Calendar, Apple Calendar, and Thunderbird.
 */

function pad(num) {
  return num < 10 ? `0${num}` : `${num}`;
}

function formatIcsDateTime(date) {
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}

/**
 * Parses time string like "10:00 AM - 10:30 AM" or "04:00 PM - 04:30 PM"
 * and returns { startHours, startMinutes, endHours, endMinutes }
 */
function parseTimeRange(timeStr) {
  const parts = timeStr.split('-').map((s) => s.trim());
  if (parts.length < 2) {
    return { startHours: 10, startMinutes: 0, endHours: 10, endMinutes: 30 };
  }

  const parseSingle = (timePart) => {
    const match = timePart.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return { hours: 10, minutes: 0 };
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = (match[3] || '').toUpperCase();

    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    return { hours, minutes };
  };

  const start = parseSingle(parts[0]);
  const end = parseSingle(parts[1]);

  return {
    startHours: start.hours,
    startMinutes: start.minutes,
    endHours: end.hours,
    endMinutes: end.minutes,
  };
}

/**
 * Calculates the exact upcoming YYYY-MM-DD date for a given weekday (e.g. Wednesday, Thursday)
 */
export function getNextDateForDay(dayName, fromDate = new Date()) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetIndex = days.findIndex((d) => d.toLowerCase() === (dayName || '').toLowerCase());
  if (targetIndex === -1) {
    const y = fromDate.getFullYear();
    const m = String(fromDate.getMonth() + 1).padStart(2, '0');
    const d = String(fromDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const result = new Date(fromDate);
  const currentIndex = result.getDay();
  let diff = targetIndex - currentIndex;
  // If target day has already passed this week, advance to next week
  if (diff < 0) {
    diff += 7;
  }
  result.setDate(result.getDate() + diff);

  const y = result.getFullYear();
  const m = String(result.getMonth() + 1).padStart(2, '0');
  const d = String(result.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Resolves the accurate calendar date for a booking.
 * Validates whether booking.date actually falls on booking.day. If mismatched or missing,
 * recalculates the proper upcoming date for that day.
 */
export function getResolvedBookingDate(booking) {
  if (!booking) return '';
  if (booking.date && /^\d{4}-\d{2}-\d{2}$/.test(booking.date)) {
    const [y, m, d] = booking.date.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const actualWeekday = days[dateObj.getDay()];
    if (actualWeekday.toLowerCase() === (booking.day || '').toLowerCase()) {
      return booking.date;
    }
  }
  return getNextDateForDay(booking.day);
}

/**
 * Formats YYYY-MM-DD into a human-friendly label like "Oct 22, 2026"
 */
export function formatDateLabel(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr || '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Calculates start and end Date objects from resolved booking date and time range
 */
export function getBookingDates(booking) {
  const { startHours, startMinutes, endHours, endMinutes } = parseTimeRange(booking.time || '10:00 AM - 10:30 AM');
  
  const resolvedDateStr = getResolvedBookingDate(booking);
  let baseDate = new Date();
  if (resolvedDateStr && /^\d{4}-\d{2}-\d{2}$/.test(resolvedDateStr)) {
    const [y, m, d] = resolvedDateStr.split('-').map(Number);
    baseDate = new Date(y, m - 1, d);
  }

  const startDate = new Date(baseDate);
  startDate.setHours(startHours, startMinutes, 0, 0);

  const endDate = new Date(baseDate);
  endDate.setHours(endHours, endMinutes, 0, 0);

  return { startDate, endDate };
}

/**
 * Checks if the session's start time has arrived or passed
 */
export function isSessionStartedOrPassed(booking) {
  try {
    const { startDate } = getBookingDates(booking);
    return new Date() >= startDate;
  } catch {
    return false;
  }
}

/**
 * Generates an RFC 5545 .ics calendar file content string
 */
export function generateIcsContent(booking) {
  const { startDate, endDate } = getBookingDates(booking);
  const now = new Date();

  const title = `SkillSwap 1:1: ${booking.topic || 'Mentorship & Knowledge Pairing'}`;
  const mentor = booking.mentorName || 'Colleague';
  const mentee = booking.menteeName || 'Colleague';
  const meetUrl = booking.meetUrl || booking.meetingUrl || 'https://meet.google.com/new';

  const descriptionLines = [
    `SkillSwap Internal 1:1 Mentorship Session`,
    `Host / Mentor: ${mentor} (${booking.mentorRole || 'Engineer'})`,
    `Learner / Mentee: ${mentee}`,
    `Topic: ${booking.topic || 'Skill Pairing'}`,
    booking.notes ? `Agenda / Notes: ${booking.notes}` : '',
    booking.prUrl ? `PR / Code Link: ${booking.prUrl}` : '',
    `Virtual Meeting Link: ${meetUrl}`,
  ].filter(Boolean);

  const description = descriptionLines.join('\\n');

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SkillSwap//Session Management//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${booking.id || Date.now()}@skillswap.portal`,
    `DTSTAMP:${formatIcsDateTime(now)}`,
    `DTSTART:${formatIcsDateTime(startDate)}`,
    `DTEND:${formatIcsDateTime(endDate)}`,
    `SUMMARY:${title.replace(/[,;]/g, ' ')}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${meetUrl}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: SkillSwap 1:1 session in 10 minutes',
    'TRIGGER:-PT10M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return icsLines.join('\r\n');
}

/**
 * Triggers a browser download of the .ics file
 */
export function downloadBookingIcs(booking) {
  const icsData = generateIcsContent(booking);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8;' });
  const filename = `skillswap-${(booking.topic || 'session').toLowerCase().replace(/[^a-z0-9]/g, '-')}.ics`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Calculates start and end Date objects for a tech talk
 */
export function getTalkDates(talk) {
  const { startHours, startMinutes, endHours, endMinutes } = parseTimeRange(talk.time || '04:00 PM - 04:45 PM');
  
  let baseDate = new Date();
  if (talk.date && /^\d{4}-\d{2}-\d{2}$/.test(talk.date)) {
    const [y, m, d] = talk.date.split('-').map(Number);
    baseDate = new Date(y, m - 1, d);
  }

  const startDate = new Date(baseDate);
  startDate.setHours(startHours, startMinutes, 0, 0);

  const endDate = new Date(baseDate);
  endDate.setHours(endHours, endMinutes, 0, 0);

  return { startDate, endDate };
}

/**
 * Generates an RFC 5545 .ics content string for a Tech Talk
 */
export function generateTalkIcsContent(talk) {
  const { startDate, endDate } = getTalkDates(talk);
  const now = new Date();

  const title = `TechTalk: ${talk.title}`;
  const speaker = `${talk.speakerName} (${talk.speakerRole || 'Speaker'})`;
  const meetUrl = talk.meetingUrl || 'https://meet.google.com/new';

  const descriptionLines = [
    `SkillSwap Internal Tech Talk / Workshop`,
    `Topic: ${talk.title}`,
    `Speaker: ${speaker}`,
    `Department: ${talk.department || 'Engineering'}`,
    `Level: ${talk.level || 'Intermediate'}`,
    `Duration: ${talk.duration || '45 mins'}`,
    talk.abstract ? `Abstract: ${talk.abstract}` : '',
    talk.slidesUrl ? `Slides & Resources: ${talk.slidesUrl}` : '',
    `Virtual Meeting Link: ${meetUrl}`,
  ].filter(Boolean);

  const description = descriptionLines.join('\\n');

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SkillSwap//Tech Talks Hub//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${talk.id || Date.now()}@skillswap.portal`,
    `DTSTAMP:${formatIcsDateTime(now)}`,
    `DTSTART:${formatIcsDateTime(startDate)}`,
    `DTEND:${formatIcsDateTime(endDate)}`,
    `SUMMARY:${title.replace(/[,;]/g, ' ')}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${meetUrl}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: SkillSwap Tech Talk starting in 15 minutes',
    'TRIGGER:-PT15M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return icsLines.join('\r\n');
}

/**
 * Downloads .ics invite for a Tech Talk
 */
export function downloadTalkIcs(talk) {
  const icsData = generateTalkIcsContent(talk);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8;' });
  const filename = `techtalk-${(talk.title || 'talk').toLowerCase().replace(/[^a-z0-9]/g, '-')}.ics`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Returns a 1-click Google Calendar web link for a Tech Talk
 */
export function getGoogleCalendarUrlForTalk(talk) {
  const { startDate, endDate } = getTalkDates(talk);
  const formatGCal = (date) =>
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z';

  const title = `TechTalk: ${talk.title}`;
  const meetUrl = talk.meetingUrl || 'https://meet.google.com/new';
  const details = [
    `SkillSwap Internal Tech Talk: ${talk.title}`,
    `Speaker: ${talk.speakerName} (${talk.speakerRole || 'Speaker'})`,
    `Level: ${talk.level || 'Intermediate'}`,
    talk.abstract || '',
    talk.slidesUrl ? `Slides: ${talk.slidesUrl}` : '',
    `Join Meeting: ${meetUrl}`
  ].filter(Boolean).join('\n\n');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatGCal(startDate)}/${formatGCal(endDate)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(meetUrl)}`;
}

