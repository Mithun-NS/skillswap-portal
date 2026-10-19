import React from 'react';
import { Presentation, BookmarkCheck, Mic, Users } from 'lucide-react';

export default function TechTalkStats({ talks = [], currentUser }) {
  const normEmail = (currentUser?.email || '').trim().toLowerCase();

  const totalUpcoming = talks.length;

  const attendingCount = talks.filter((t) => {
    const list = Array.isArray(t.attendees) ? t.attendees : [];
    return list.some((e) => (e || '').toString().trim().toLowerCase() === normEmail);
  }).length;

  const hostingCount = talks.filter((t) => {
    return (t.speakerEmail || '').toString().trim().toLowerCase() === normEmail;
  }).length;

  const totalCommunityRSVPs = talks.reduce((acc, t) => {
    return acc + (Array.isArray(t.attendees) ? t.attendees.length : 0);
  }, 0);

  const stats = [
    {
      label: 'Scheduled Talks',
      value: totalUpcoming,
      sublabel: 'Active workshops & demos',
      icon: Presentation,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      gradient: 'from-orange-500/10 to-amber-500/5',
    },
    {
      label: 'Attending (RSVP)',
      value: attendingCount,
      sublabel: 'Added to your calendar',
      icon: BookmarkCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      gradient: 'from-emerald-500/10 to-teal-500/5',
    },
    {
      label: 'Presenting / Hosting',
      value: hostingCount,
      sublabel: 'Talks led by you',
      icon: Mic,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      gradient: 'from-indigo-500/10 to-purple-500/5',
    },
    {
      label: 'Community RSVPs',
      value: totalCommunityRSVPs,
      sublabel: 'Colleagues engaged',
      icon: Users,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      gradient: 'from-cyan-500/10 to-blue-500/5',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden p-4 rounded-xl bg-gradient-to-br ${stat.gradient} bg-[#141b26] border ${stat.border} shadow-sm hover:border-slate-600/60 transition-all duration-200 group`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">{stat.label}</span>
              <div
                className={`w-8 h-8 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center border ${stat.border} group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white tracking-tight">{stat.value}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 truncate">{stat.sublabel}</p>
          </div>
        );
      })}
    </div>
  );
}
