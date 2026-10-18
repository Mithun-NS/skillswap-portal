import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  ExternalLink, 
  CalendarPlus, 
  CheckCircle2, 
  XCircle, 
  Mail, 
  GitPullRequest, 
  MessageSquare, 
  User, 
  Users,
  ShieldCheck,
  AlertCircle,
  Trash2,
  Sparkles
} from 'lucide-react';
import { 
  downloadBookingIcs, 
  isSessionStartedOrPassed, 
  getResolvedBookingDate, 
  formatDateLabel 
} from '../../utils/calendar';

export default function SessionCard({ 
  booking, 
  currentUserId, 
  currentUserEmail, 
  currentUserName,
  onCancel, 
  onComplete,
  onDelete
}) {
  const [hasJoinedMeet, setHasJoinedMeet] = useState(() => {
    try {
      return localStorage.getItem(`skillswap_meet_joined_${booking.id}`) === 'true';
    } catch {
      return false;
    }
  });

  const isStarted = isSessionStartedOrPassed(booking);

  const handleJoinMeet = () => {
    setHasJoinedMeet(true);
    try {
      localStorage.setItem(`skillswap_meet_joined_${booking.id}`, 'true');
    } catch {}
  };
  const clean = (val) => (val || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');
  const normName = clean(currentUserName);
  const normEmail = clean(currentUserEmail);
  const normId = clean(currentUserId);

  const isMentee = Boolean(
    (normId && (clean(booking.menteeId) === normId || clean(booking.menteeId) === `usr_${normId}`)) ||
    (normEmail && clean(booking.menteeEmail) === normEmail) ||
    (normName && clean(booking.menteeName) === normName)
  );

  const isMentor = Boolean(
    (normId && (clean(booking.mentorId) === normId || clean(booking.mentorId) === `usr_${normId}`)) ||
    (normEmail && clean(booking.mentorEmail) === normEmail) ||
    (normName && clean(booking.mentorName) === normName)
  );

  // Determine counterpart information
  const partnerName = isMentee 
    ? booking.mentorName 
    : isMentor 
    ? booking.menteeName 
    : `${booking.mentorName} & ${booking.menteeName}`;

  const partnerRole = isMentee
    ? (booking.mentorRole || 'Host / Mentor')
    : isMentor
    ? 'Learner / Mentee'
    : `Mentor: ${booking.mentorName} • Mentee: ${booking.menteeName}`;

  const partnerEmail = isMentee ? booking.mentorEmail : booking.menteeEmail;

  const displayAvatar = isMentee
    ? booking.mentorName
    : isMentor
    ? booking.menteeName
    : booking.mentorName;

  const partnerInitials = (displayAvatar || 'SS')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const isConfirmed = booking.status === 'confirmed';
  const isCompleted = booking.status === 'completed';
  const isCancelled = booking.status === 'cancelled';

  const meetUrl = booking.meetUrl || booking.meetingUrl || 'https://meet.google.com/new';

  return (
    <div className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-lg ${
      isConfirmed
        ? 'bg-[#141b26] border-[#1e293b] hover:border-slate-700/80'
        : isCompleted
        ? 'bg-[#121822]/90 border-blue-900/30'
        : 'bg-[#10151e]/80 border-rose-950/30 opacity-80'
    }`}>
      {/* Top Bar: Role & Status */}
      <div className="px-5 py-3.5 border-b border-[#1e293b] flex items-center justify-between gap-3 bg-[#0e141d]/60">
        <div className="flex items-center gap-2">
          {isMentee ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <User className="w-3.5 h-3.5" />
              You are Learning (Mentee)
            </span>
          ) : isMentor ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              You are Hosting (Mentor)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              Team Knowledge Session
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isConfirmed && hasJoinedMeet && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 animate-in fade-in">
              <Video className="w-3.5 h-3.5 text-emerald-400" />
              Meet Joined
            </span>
          )}
          {isConfirmed && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Upcoming
            </span>
          )}
          {isCompleted && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed
            </span>
          )}
          {isCancelled && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <XCircle className="w-3.5 h-3.5" />
              Cancelled
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5 sm:p-6 space-y-5">
        {/* Partner & Schedule Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Partner Info */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f97316] via-orange-600 to-amber-600 flex items-center justify-center text-sm font-black text-white shadow-md shadow-orange-500/10 shrink-0">
              {partnerInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-white tracking-tight">
                  {partnerName}
                </h4>
                {partnerEmail && (
                  <a
                    href={`mailto:${partnerEmail}?subject=SkillSwap Session: ${encodeURIComponent(booking.topic || 'Mentorship')}`}
                    title={`Email ${partnerEmail}`}
                    className="text-slate-400 hover:text-orange-400 transition-colors p-1"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <p className="text-xs text-slate-400">{partnerRole}</p>
            </div>
          </div>

          {/* Time & Day Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-[#0e141d] border border-[#1e293b] flex items-center gap-2 text-xs font-medium text-slate-200">
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
              <span className="font-semibold text-white">{booking.day}</span>
              <span className="text-slate-400">• {formatDateLabel(getResolvedBookingDate(booking))}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#0e141d] border border-[#1e293b] flex items-center gap-2 text-xs font-semibold text-white">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              <span>{booking.time}</span>
            </div>
          </div>
        </div>

        {/* Topic & Notes */}
        <div className="p-4 rounded-xl bg-[#0e141d] border border-[#1e293b] space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Discussion Focus
          </div>
          <p className="text-sm font-semibold text-white">
            {booking.topic}
          </p>
          {booking.notes && (
            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              {booking.notes}
            </p>
          )}

          {booking.prUrl && (
            <div className="pt-2">
              <a
                href={booking.prUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors underline underline-offset-2"
              >
                <GitPullRequest className="w-3.5 h-3.5" />
                Pull Request: {booking.prUrl}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Completed Feedback Note */}
        {isCompleted && (
          <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-800/30 text-xs text-blue-200 space-y-1">
            <span className="font-semibold text-blue-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              Session Takeaways & Action Items:
            </span>
            <p className="text-slate-300 italic">
              "{booking.feedbackNote || 'Session completed with constructive knowledge pairing.'}"
            </p>
          </div>
        )}

        {/* Cancelled Reason */}
        {isCancelled && (
          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-800/30 text-xs text-rose-300 space-y-1">
            <span className="font-semibold flex items-center gap-1.5 text-rose-400">
              <AlertCircle className="w-3.5 h-3.5" />
              Cancellation Reason:
            </span>
            <p className="text-slate-300">
              {booking.cancelReason || 'Cancelled by colleague. Slot returned to open availability.'}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#1e293b]">
          {/* Left Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadBookingIcs(booking)}
              title="Download .ics Calendar Invite for Outlook / Google Calendar"
              className="px-3 py-2 rounded-xl bg-[#0e141d] hover:bg-slate-800 border border-[#1e293b] text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-2"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-orange-400" />
              Export .ics
            </button>

            {partnerEmail && (
              <a
                href={`mailto:${partnerEmail}?subject=SkillSwap Session: ${encodeURIComponent(booking.topic || 'Mentorship')}`}
                className="px-3 py-2 rounded-xl bg-[#0e141d] hover:bg-slate-800 border border-[#1e293b] text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-2"
              >
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email
              </a>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {isConfirmed && (
              <>
                <button
                  onClick={() => onCancel(booking)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                >
                  Cancel
                </button>

                <button
                  onClick={() => onComplete(booking, { hasJoinedMeet, isStarted, onJoinMeet: handleJoinMeet })}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    hasJoinedMeet || isStarted
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 shadow-sm shadow-emerald-500/10'
                      : 'text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-slate-700/60'
                  }`}
                  title={hasJoinedMeet || isStarted ? 'Record takeaways & complete session' : 'Session scheduled in future — joining Google Meet first is recommended'}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {hasJoinedMeet ? 'Wrap Up & Complete' : 'Mark Complete'}
                </button>

                <a
                  href={meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleJoinMeet}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2"
                >
                  <Video className="w-3.5 h-3.5" />
                  Join Google Meet
                  <ExternalLink className="w-3 h-3 text-white/80" />
                </a>
              </>
            )}

            {isCompleted && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 italic">
                  Logged in team pairing records
                </span>
                {onDelete && (
                  <button
                    onClick={() => onDelete(booking)}
                    title="Remove from history"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {isCancelled && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  Slot released to colleague schedule
                </span>
                {onDelete && (
                  <button
                    onClick={() => onDelete(booking)}
                    title="Remove cancelled session"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
