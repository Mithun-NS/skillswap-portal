import React, { useState } from 'react';
import { 
  CheckCircle2, 
  X, 
  Sparkles, 
  Calendar, 
  Clock, 
  Video, 
  AlertCircle, 
  ExternalLink,
  Users
} from 'lucide-react';
import { isSessionStartedOrPassed, formatDateLabel, getResolvedBookingDate } from '../../utils/calendar';

const QUICK_TAKEAWAYS = [
  'Deep dive architecture reviewed & clear action items agreed',
  'Debugging resolved blockers and tests now passing',
  'Code pairing completed successfully with refactoring tips',
  'Great career guidance and engineering pathway discussion'
];

export default function CompleteSessionModal({ 
  booking, 
  onClose, 
  onConfirm, 
  isSubmitting,
  hasJoinedMeet,
  onJoinMeet
}) {
  const [feedbackNote, setFeedbackNote] = useState('');
  const [selectedQuickNote, setSelectedQuickNote] = useState('');
  const [offlineOverride, setOfflineOverride] = useState(false);

  if (!booking) return null;

  const isStarted = isSessionStartedOrPassed(booking);
  const meetUrl = booking.meetUrl || booking.meetingUrl || 'https://meet.google.com/new';
  const showUnattendedPrompt = !hasJoinedMeet && !isStarted && !offlineOverride;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalNote = feedbackNote.trim() || selectedQuickNote || 'Session completed successfully with peer knowledge pairing.';
    onConfirm(finalNote);
  };

  const handleLaunchMeet = () => {
    if (onJoinMeet) onJoinMeet();
    window.open(meetUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[#141b26] border border-[#1e293b] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="p-4 sm:p-5 border-b border-[#1e293b] flex items-center justify-between bg-gradient-to-r from-emerald-950/20 via-[#141b26] to-[#141b26] shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
              showUnattendedPrompt
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              {showUnattendedPrompt ? (
                <Video className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {showUnattendedPrompt ? 'Live Meeting Recommended' : 'Wrap Up & Complete Session'}
              </h3>
              <p className="text-xs text-slate-400">
                {showUnattendedPrompt
                  ? 'Join the Google Meet call with your colleague first'
                  : 'Log paired hours, archive slot, and capture action items'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {showUnattendedPrompt ? (
            /* Unattended Screen */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-300 text-xs sm:text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Meeting Scheduled for {booking.day}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  You haven't joined the Google Meet session for <strong className="text-white">{booking.topic}</strong> yet. Mentorship sessions should be attended together before logging completion.
                </p>
              </div>

              {/* Schedule Box */}
              <div className="p-3.5 rounded-xl bg-[#0e141d] border border-[#1e293b] space-y-2 text-xs">
                <div className="font-semibold text-white truncate">{booking.topic}</div>
                <div className="flex flex-wrap items-center gap-3 text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-orange-400" />
                    <span className="font-medium text-white">{booking.day}</span>
                    <span className="text-slate-400">• {formatDateLabel(getResolvedBookingDate(booking))}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-400" />
                    <span>{booking.time}</span>
                  </span>
                </div>
              </div>

              {/* Primary Call To Action */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleLaunchMeet}
                  className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  Join Google Meet Call Now
                  <ExternalLink className="w-3.5 h-3.5 text-white/80" />
                </button>

                <button
                  type="button"
                  onClick={() => setOfflineOverride(true)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-[#0e141d] hover:bg-slate-800/80 border border-[#1e293b] transition-colors flex items-center justify-center gap-2"
                >
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  We Paired Offline / In-Person (Skip Meet)
                </button>
              </div>
            </div>
          ) : (
            /* Full Completion Form */
            <form id="complete-session-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Value reminder banner */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Completion Rewards</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Awards <strong>+0.5 hours</strong> pairing credit, logs action items to company history, and archives to <em>Completed & History</em>.
                </p>
              </div>

              {/* Booking Summary */}
              <div className="p-3.5 rounded-xl bg-[#0e141d] border border-[#1e293b] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white truncate max-w-[260px]">{booking.topic}</span>
                  <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                    +0.5 hr credit
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-orange-400" />
                    <span>{booking.day}</span>
                    <span className="text-slate-400">• {formatDateLabel(getResolvedBookingDate(booking))}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-400" />
                    <span>{booking.time}</span>
                  </span>
                </div>
              </div>

              {/* Quick Takeaways suggestions */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Quick Takeaways Suggestions
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {QUICK_TAKEAWAYS.map((note) => (
                    <button
                      type="button"
                      key={note}
                      onClick={() => {
                        setSelectedQuickNote(note);
                        setFeedbackNote(note);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${
                        feedbackNote === note
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 font-medium'
                          : 'bg-[#0e141d] border-[#1e293b] text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      "{note}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Action Items / Feedback */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Session Takeaways & Action Items
                </label>
                <textarea
                  rows={2}
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  placeholder="What did you work through? Any follow-up links or next steps?"
                  className="w-full px-3 py-2 rounded-xl bg-[#0e141d] border border-[#1e293b] text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none transition-colors"
                />
              </div>
            </form>
          )}
        </div>

        {/* Fixed Footer Actions */}
        <div className="p-4 border-t border-[#1e293b] bg-[#0e141d] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors"
          >
            {showUnattendedPrompt ? 'Close' : 'Keep in Upcoming'}
          </button>

          {!showUnattendedPrompt && (
            <button
              type="submit"
              form="complete-session-form"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm & Complete Session
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
