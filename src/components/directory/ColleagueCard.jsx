import React from 'react';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  UserCheck,
  Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ColleagueCard({ colleague, isCurrentUser, onBookSession }) {
  if (!colleague) return null;

  const openSlots = (colleague.availableSlots || []).filter((s) => !s.isBooked);
  const openSlotCount = openSlots.length;

  const initials = (colleague.name || 'CN')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="rounded-2xl bg-[#141b26] border border-[#1e293b] p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 hover:shadow-2xl hover:shadow-orange-500/5 transition-all group duration-200">
      <div className="space-y-4">
        {/* Card Header: Avatar, Name, Role, Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f97316] via-orange-600 to-amber-600 flex items-center justify-center text-sm font-black text-white shadow-md shadow-orange-500/10 ring-1 ring-orange-500/30 shrink-0 group-hover:scale-105 transition-transform">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-orange-400 transition-colors">
                  {colleague.name}
                </h3>
                {isCurrentUser && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    You
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 font-medium">
                {colleague.role || 'Software Engineer'}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                <span className="truncate max-w-[150px]">{colleague.department}</span>
                <span>•</span>
                <span>{colleague.experienceYears || 0}y exp</span>
              </div>
            </div>
          </div>

          {/* Availability pill */}
          <span 
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 shrink-0 ${
              openSlotCount > 0
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-800/80 text-slate-400 border-slate-700/60'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${openSlotCount > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
            <span>{openSlotCount > 0 ? `${openSlotCount} Slot${openSlotCount === 1 ? '' : 's'} Open` : 'No Open Slots'}</span>
          </span>
        </div>

        {/* Bio */}
        {colleague.bio && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {colleague.bio}
          </p>
        )}

        {/* Skills Can Mentor / Teach */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">
            Can Mentor In
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(colleague.skillsToTeach || []).length === 0 ? (
              <span className="text-xs text-slate-500 italic">No mentorship skills listed yet</span>
            ) : (
              (colleague.skillsToTeach || []).slice(0, 5).map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#0e141d] text-orange-300 border border-orange-500/30"
                >
                  {skill}
                </span>
              ))
            )}
            {(colleague.skillsToTeach || []).length > 5 && (
              <span className="text-[10px] font-semibold text-slate-500 self-center">
                +{(colleague.skillsToTeach || []).length - 5} more
              </span>
            )}
          </div>
        </div>

        {/* Skills Want to Learn */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
            Seeking Mentorship In
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(colleague.skillsToLearn || []).length === 0 ? (
              <span className="text-xs text-slate-500 italic">No learning goals listed</span>
            ) : (
              (colleague.skillsToLearn || []).slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#0e141d] text-emerald-300 border border-emerald-500/30"
                >
                  {skill}
                </span>
              ))
            )}
            {(colleague.skillsToLearn || []).length > 4 && (
              <span className="text-[10px] font-semibold text-slate-500 self-center">
                +{(colleague.skillsToLearn || []).length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: Capacity & Booking Action */}
      <div className="pt-5 mt-4 border-t border-[#1e293b] flex items-center justify-between gap-3">
        <div className="text-[11px] text-slate-400">
          <span className="text-slate-500">Weekly Cap: </span>
          <strong className="text-slate-300 font-semibold">{colleague.weeklySessionCap || 2} / week</strong>
        </div>

        {isCurrentUser ? (
          <Link
            to="/my-profile"
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#1a2332] hover:bg-[#222e42] text-slate-200 border border-[#2d3d54] transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
          >
            <span>Edit My Profile</span>
            <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
          </Link>
        ) : (
          <button
            type="button"
            disabled={openSlotCount === 0}
            onClick={() => onBookSession(colleague)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
              openSlotCount > 0
                ? 'bg-gradient-to-r from-[#f97316] to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white shadow-orange-500/20 hover:shadow-orange-500/30 hover:translate-y-[-1px]'
                : 'bg-[#0e141d] text-slate-500 border border-[#1e293b] cursor-not-allowed opacity-60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{openSlotCount > 0 ? 'Book 1:1 Session' : 'No Open Slots'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
