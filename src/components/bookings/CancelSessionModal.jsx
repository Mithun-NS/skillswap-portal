import React, { useState } from 'react';
import { AlertTriangle, X, Check, Calendar, Clock } from 'lucide-react';
import { formatDateLabel, getResolvedBookingDate } from '../../utils/calendar';

const REASON_OPTIONS = [
  'Schedule conflict / urgent meeting',
  'Topic already resolved with colleague',
  'Need to reschedule to another date',
  'Out of office / Personal emergency',
  'Other reason'
];

export default function CancelSessionModal({ booking, onClose, onConfirm, isSubmitting }) {
  const [selectedReason, setSelectedReason] = useState(REASON_OPTIONS[0]);
  const [customNote, setCustomNote] = useState('');

  if (!booking) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalReason = selectedReason === 'Other reason'
      ? (customNote.trim() || 'Cancelled by user')
      : (customNote.trim() ? `${selectedReason} - ${customNote.trim()}` : selectedReason);
    onConfirm(finalReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[#141b26] border border-[#1e293b] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1e293b] flex items-center justify-between bg-gradient-to-r from-rose-950/20 via-[#141b26] to-[#141b26] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Cancel Mentorship Session</h3>
              <p className="text-xs text-slate-400">This action will release the slot for other colleagues</p>
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

        {/* Form Body with scroll */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <form id="cancel-session-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Booking Summary Box */}
          <div className="p-4 rounded-xl bg-[#0e141d] border border-[#1e293b] space-y-2">
            <div className="text-sm font-semibold text-white truncate">
              {booking.topic || 'Mentorship Session'}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-orange-400" />
                <span className="font-semibold text-white">{booking.day}</span>
                <span className="text-slate-400">• {formatDateLabel(getResolvedBookingDate(booking))}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                {booking.time}
              </span>
            </div>
            <div className="text-xs text-slate-400 pt-1">
              Colleague: <span className="text-slate-200 font-medium">{booking.mentorName} / {booking.menteeName}</span>
            </div>
          </div>

          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Reason for Cancellation
            </label>
            <div className="space-y-1.5">
              {REASON_OPTIONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedReason === reason
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : 'bg-[#0e141d] border-[#1e293b] text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="cancelReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="sr-only"
                    />
                    {reason}
                  </span>
                  {selectedReason === reason && (
                    <Check className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Optional Note */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Additional Note (Optional)
            </label>
            <textarea
              rows={2}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Will catch up next week via Slack..."
              className="w-full px-3 py-2 rounded-xl bg-[#0e141d] border border-[#1e293b] text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:border-rose-500/50 resize-none transition-colors"
            />
          </div>
        </form>
      </div>

      {/* Fixed Action Buttons */}
      <div className="p-4 border-t border-[#1e293b] bg-[#0e141d] flex items-center justify-end gap-3 shrink-0">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors"
        >
          Keep Session
        </button>
        <button
          type="submit"
          form="cancel-session-form"
          disabled={isSubmitting}
          className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/25 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Cancelling...
            </>
          ) : (
            'Confirm Cancellation'
          )}
        </button>
      </div>
    </div>
  </div>
);
}
