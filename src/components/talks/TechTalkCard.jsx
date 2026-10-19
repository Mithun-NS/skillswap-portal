import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  ExternalLink, 
  BookmarkCheck, 
  Check, 
  CalendarPlus, 
  Download, 
  Trash2, 
  Users, 
  Sparkles,
  Presentation,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatDateLabel, downloadTalkIcs, getGoogleCalendarUrlForTalk } from '../../utils/calendar';

export default function TechTalkCard({
  talk,
  currentUser,
  onToggleRsvp,
  onDeleteTalk,
  allUsers = []
}) {
  const [expanded, setExpanded] = useState(false);
  const [showCalendarMenu, setShowCalendarMenu] = useState(false);
  const [showAttendeesList, setShowAttendeesList] = useState(false);
  const [isRsvping, setIsRsvping] = useState(false);

  const currentUserEmail = (currentUser?.email || '').trim().toLowerCase();
  const currentUserName = (currentUser?.name || '').trim().toLowerCase();
  const isSpeaker =
    (talk.speakerEmail || '').trim().toLowerCase() === currentUserEmail ||
    (talk.speakerName || '').trim().toLowerCase() === currentUserName;

  const attendeesList = Array.isArray(talk.attendees) ? talk.attendees : [];
  const isAttending = attendeesList.some(
    (email) => (email || '').toString().trim().toLowerCase() === currentUserEmail
  );

  // Difficulty badge styling
  const getLevelBadge = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'advanced':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'intermediate':
      default:
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
  };

  const handleRsvpClick = async () => {
    try {
      setIsRsvping(true);
      if (!isAttending) {
        // Trigger celebratory confetti on joining a talk!
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#6366f1', '#10b981', '#f59e0b', '#3b82f6'],
          });
        } catch {
          // ignore canvas-confetti error in non-browser environments
        }
      }
      await onToggleRsvp(talk.id);
    } finally {
      setIsRsvping(false);
    }
  };

  // Find user objects for attendee avatars
  const attendeeProfiles = attendeesList.slice(0, 5).map((email) => {
    const found = allUsers.find(
      (u) => (u.email || '').trim().toLowerCase() === email.trim().toLowerCase()
    );
    const name = found?.name || email.split('@')[0].replace('.', ' ');
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    return { email, name, initials };
  });

  const formattedDate = formatDateLabel(talk.date);
  const meetUrl = talk.meetingUrl || 'https://meet.google.com/new';

  return (
    <div className="relative rounded-2xl bg-[#141b26] border border-[#1e293b] hover:border-slate-600/70 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      {/* Top accent gradient bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 opacity-80" />

      <div className="p-5 flex-1">
        {/* Header: Level Badge, Duration & Speaker Host Tag */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getLevelBadge(
                talk.level
              )} uppercase tracking-wider`}
            >
              {talk.level || 'Intermediate'}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
              <Clock className="w-3 h-3 text-slate-400" />
              {talk.duration || '45 mins'}
            </span>
          </div>

          {isSpeaker && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              You are Speaker
            </span>
          )}
        </div>

        {/* Talk Title */}
        <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors line-clamp-2">
          {talk.title}
        </h3>

        {/* Speaker Profile Header */}
        <div className="mt-3.5 flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-inner flex-shrink-0">
            {talk.speakerName
              ?.split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase() || 'SP'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-200 truncate">{talk.speakerName}</p>
            <p className="text-xs text-slate-400 truncate">
              {talk.speakerRole} • <span className="text-slate-300">{talk.department}</span>
            </p>
          </div>
        </div>

        {/* Abstract */}
        <div className="mt-3.5">
          <p
            className={`text-xs text-slate-300 leading-relaxed ${
              expanded ? '' : 'line-clamp-3'
            }`}
          >
            {talk.abstract}
          </p>
          {talk.abstract && talk.abstract.length > 140 && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="mt-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Date & Time pill */}
        <div className="mt-4 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-200 font-medium truncate">
            <Calendar className="w-4 h-4 text-orange-400 flex-shrink-0" />
            <span className="truncate">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300 font-medium flex-shrink-0">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{talk.time}</span>
          </div>
        </div>

        {/* Meeting & Slides Links Row */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <a
            href={meetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Video className="w-3.5 h-3.5" />
            Join Google Meet
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>

          {talk.slidesUrl && (
            <a
              href={talk.slidesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Slides / Notes
            </a>
          )}

          {/* Calendar Dropdown */}
          <div className="relative ml-auto">
            <button
              type="button"
              onClick={() => setShowCalendarMenu(!showCalendarMenu)}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 px-2.5 py-1.5 rounded-lg transition-colors"
              title="Add to your personal work calendar"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-orange-400" />
              <span>Calendar</span>
            </button>

            {showCalendarMenu && (
              <div className="absolute right-0 bottom-full mb-1.5 w-48 bg-[#1a2333] border border-[#2d3748] rounded-xl shadow-2xl py-1.5 z-20 animate-in fade-in zoom-in-95 duration-150">
                <a
                  href={getGoogleCalendarUrlForTalk(talk)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowCalendarMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700/50 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                  Google Calendar
                </a>
                <button
                  type="button"
                  onClick={() => {
                    downloadTalkIcs(talk);
                    setShowCalendarMenu(false);
                  }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700/50 hover:text-white transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  Download .ics (Outlook/Apple)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer: Attendees Counter with Dark Popover & RSVP Action Button */}
      <div className="px-5 py-3.5 bg-slate-900/80 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Attendees Pill Badge with Custom Dark Popover */}
        <div className="relative">
          <div
            onMouseEnter={() => setShowAttendeesList(true)}
            onMouseLeave={() => setShowAttendeesList(false)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700/80 hover:border-slate-600 shadow-sm transition-all cursor-pointer group/att"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Users className="w-3.5 h-3.5 text-slate-400 group-hover/att:text-indigo-400 transition-colors" />
            <span className="text-xs font-semibold text-slate-200">
              {attendeesList.length === 0
                ? 'No RSVPs yet'
                : `${attendeesList.length} ${
                    attendeesList.length === 1 ? 'Colleague Attending' : 'Colleagues Attending'
                  }`}
            </span>
          </div>

          {/* Custom Sleek Dark Popover (No white OS browser tooltip) */}
          {showAttendeesList && (
            <div 
              onMouseEnter={() => setShowAttendeesList(true)}
              onMouseLeave={() => setShowAttendeesList(false)}
              className="absolute left-0 bottom-full mb-2 w-64 bg-[#141b26] border border-[#2d3748] rounded-xl shadow-2xl p-3 z-30 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  Registered Colleagues
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {attendeesList.length}
                </span>
              </div>
              {attendeeProfiles.length === 0 ? (
                <p className="text-xs text-slate-400 py-1">Be the first colleague to RSVP!</p>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                  {attendeeProfiles.map((att, i) => {
                    const isCurrent = att.email.toLowerCase() === currentUserEmail;
                    return (
                      <div key={i} className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-800/60 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shadow-inner flex-shrink-0">
                          {att.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1">
                            {att.name}
                            {isCurrent && (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">{att.email}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Button Strip */}
        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
          {isSpeaker && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Are you sure you want to cancel the talk "${talk.title}"?`)) {
                  onDeleteTalk(talk.id);
                }
              }}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/30 transition-colors"
              title="Cancel / Delete Talk"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            disabled={isRsvping}
            onClick={handleRsvpClick}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all duration-200 active:scale-95 ${
              isAttending
                ? 'bg-emerald-500/20 hover:bg-rose-500/20 text-emerald-300 hover:text-rose-300 border border-emerald-500/40 hover:border-rose-500/40 group/rsvp'
                : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:to-purple-700 text-white border border-indigo-400/30 shadow-indigo-500/20'
            }`}
          >
            {isAttending ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 group-hover/rsvp:hidden" />
                <span className="group-hover/rsvp:hidden">Attending ✓</span>
                <span className="hidden group-hover/rsvp:inline">Cancel RSVP ✕</span>
              </>
            ) : (
              <>
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>RSVP Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
