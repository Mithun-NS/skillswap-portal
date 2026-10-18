import React from 'react';
import { CalendarCheck, Clock, UserCheck, GraduationCap, CheckCircle2 } from 'lucide-react';

export default function SessionStats({ bookings, currentUserId, currentUserEmail, currentUserName }) {
  const clean = (val) => (val || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');
  const normName = clean(currentUserName);
  const normEmail = clean(currentUserEmail);
  const normId = clean(currentUserId);

  const isMentee = (b) => {
    if (normId && (clean(b.menteeId) === normId || clean(b.menteeId) === `usr_${normId}`)) return true;
    if (normEmail && clean(b.menteeEmail) === normEmail) return true;
    if (normName && clean(b.menteeName) === normName) return true;
    return false;
  };

  const isMentor = (b) => {
    if (normId && (clean(b.mentorId) === normId || clean(b.mentorId) === `usr_${normId}`)) return true;
    if (normEmail && clean(b.mentorEmail) === normEmail) return true;
    if (normName && clean(b.mentorName) === normName) return true;
    return false;
  };

  const upcoming = bookings.filter((b) => b.status === 'confirmed');
  const completed = bookings.filter((b) => b.status === 'completed');
  const attending = upcoming.filter(isMentee);
  const hosting = upcoming.filter(isMentor);

  // Each completed or confirmed session is estimated at 30 minutes (0.5 hours)
  const totalHours = ((completed.length * 0.5) || 0).toFixed(1);

  const stats = [
    {
      label: 'Upcoming Sessions',
      value: upcoming.length,
      icon: CalendarCheck,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10 border-orange-500/20',
      pill: upcoming.length > 0 ? `${upcoming.length} active` : 'None',
      pillColor: upcoming.length > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700',
      hasPulse: upcoming.length > 0,
    },
    {
      label: 'Hours Paired',
      value: `${totalHours} hrs`,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      pill: `${completed.length} completed`,
      pillColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      hasPulse: false,
    },
    {
      label: 'Learning as Mentee',
      value: attending.length,
      icon: GraduationCap,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/20',
      pill: 'Attending',
      pillColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      hasPulse: false,
    },
    {
      label: 'Guiding as Mentor',
      value: hosting.length,
      icon: UserCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      pill: 'Hosting',
      pillColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      hasPulse: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, idx) => {
        const Icon = s.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-[#141b26] border border-[#1e293b] shadow-md hover:border-slate-700/80 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                {s.label}
              </span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${s.bg}`}>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl font-black text-white tracking-tight">
                {s.value}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.pillColor}`}>
                {s.hasPulse && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
                {s.pill}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
