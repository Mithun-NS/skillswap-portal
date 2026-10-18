import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  CalendarCheck, 
  AlertCircle,
  ExternalLink,
  Sparkles,
  Check,
  Video,
  ChevronRight,
  User,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const WORKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const QUICK_TOPICS = [
  'Architecture & Design Review',
  'Code Pairing & Debugging',
  'Performance Optimization',
  'Career & Engineering Advice'
];

export default function BookingModal({ colleague, onClose, onBookingSuccess }) {
  const { user: currentUser } = useAuth();
  
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [topic, setTopic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [bookingResult, setBookingResult] = useState(null);

  if (!colleague) return null;

  // All slots configured by the colleague
  const allSlots = colleague.availableSlots || [];
  const openSlots = allSlots.filter((s) => !s.isBooked);
  const totalOpenCount = openSlots.length;

  // Workdays that have at least one slot configured
  const daysWithSlots = WORKDAYS.filter((day) => 
    allSlots.some((s) => s.day === day)
  );

  const [activeDay, setActiveDay] = useState(daysWithSlots[0] || WORKDAYS[0]);

  // All slots on active day (both open and booked)
  const activeDaySlots = allSlots.filter((s) => s.day === activeDay);

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlot || selectedSlot.isBooked) {
      setError('Please choose an available (unbooked) time slot.');
      return;
    }
    if (!topic.trim()) {
      setError('Please provide a brief topic or goal for this 1:1 session.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const bookingPayload = {
        mentorId: colleague.id || colleague._id,
        mentorName: colleague.name,
        mentorEmail: colleague.email || '',
        mentorRole: colleague.role || '',
        menteeId: currentUser?.id || currentUser?._id || 'usr_guest',
        menteeName: currentUser?.name || 'Current User',
        menteeEmail: currentUser?.email || 'colleague@intimetec.com',
        slotId: selectedSlot.id,
        day: selectedSlot.day,
        date: new Date().toISOString().split('T')[0],
        time: selectedSlot.time,
        topic: topic.trim(),
        status: 'confirmed',
        meetUrl: 'https://meet.google.com/new',
        meetingUrl: 'https://meet.google.com/new', // Google Meet room link
      };

      const result = await api.createBooking(bookingPayload);
      selectedSlot.isBooked = true; // Immediately update local object
      setBookingResult(result || bookingPayload);
      if (onBookingSuccess) {
        onBookingSuccess(colleague.id, selectedSlot.id, selectedSlot.day, selectedSlot.time);
      }
    } catch (err) {
      setError(err.message || 'Failed to confirm booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const colleagueInitials = (colleague.name || 'CN')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl rounded-2xl bg-[#141b26] border border-[#1e293b] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="p-5 sm:p-6 border-b border-[#1e293b] flex items-center justify-between bg-gradient-to-r from-[#141b26] via-[#17202e] to-[#141b26]">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#f97316] via-orange-600 to-amber-600 flex items-center justify-center text-base font-black text-white shadow-lg shadow-orange-500/15 ring-2 ring-orange-500/20 shrink-0">
              {colleagueInitials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {colleague.name}
                </h3>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
                  {colleague.department}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                {colleague.role} • {colleague.experienceYears || 0} years experience
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#0e141d] border border-[#1e293b] text-slate-400 hover:text-white hover:bg-[#1e293b] flex items-center justify-center transition-colors shrink-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {bookingResult ? (
            /* Success View */
            <div className="py-4 text-center space-y-5 animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
                <CalendarCheck className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-xl font-extrabold text-white tracking-tight">
                  1:1 Session Confirmed!
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
                  Your mentorship session with <strong className="text-white">{colleague.name}</strong> has been scheduled and added to the registry.
                </p>
              </div>

              {/* Booking Summary Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#0e141d] border border-[#1e293b] text-left space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#1e293b]">
                  <span className="text-slate-400 font-medium">Scheduled Time</span>
                  <span className="font-bold text-orange-400 flex items-center gap-1.5 text-xs sm:text-sm">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <span>{bookingResult.day}, {bookingResult.time}</span>
                  </span>
                </div>

                <div className="flex items-start justify-between pb-2.5 border-b border-[#1e293b]">
                  <span className="text-slate-400 font-medium">Discussion Topic</span>
                  <span className="font-semibold text-slate-200 text-right max-w-[260px] leading-relaxed">
                    {bookingResult.topic}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Video Meeting</span>
                  </span>
                  <a
                    href={bookingResult.meetingUrl || 'https://meet.google.com/new'}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 transition-colors"
                  >
                    <span>Open Google Meet</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#f97316] hover:bg-orange-500 text-white shadow-lg shadow-orange-500/20 transition-all hover:translate-y-[-1px] active:scale-95"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleConfirmBooking} className="space-y-6">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Section 1: Workday & Slot Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#f97316]" />
                    <span>1. Select an Available Time Slot</span>
                  </label>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {totalOpenCount} slot{totalOpenCount === 1 ? '' : 's'} open this week
                  </span>
                </div>

                {allSlots.length === 0 ? (
                  <div className="p-6 rounded-xl bg-[#0e141d] border border-[#1e293b] text-center space-y-1">
                    <p className="text-xs font-bold text-white">No Availability Slots Configured</p>
                    <p className="text-xs text-slate-400">
                      {colleague.name} hasn't configured recurring availability blocks yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Workday navigation tabs */}
                    <div className="grid grid-cols-5 gap-1.5 p-1 rounded-xl bg-[#0e141d] border border-[#1e293b]">
                      {WORKDAYS.map((day) => {
                        const daySlots = allSlots.filter((s) => s.day === day);
                        const openCount = daySlots.filter((s) => !s.isBooked).length;
                        const isActive = activeDay === day;

                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              setActiveDay(day);
                              setSelectedSlot(null);
                            }}
                            className={`py-2 px-1 rounded-lg text-xs font-semibold transition-all flex flex-col items-center justify-center gap-1 ${
                              isActive
                                ? 'bg-[#f97316] text-white shadow-md shadow-orange-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-[#141b26]'
                            }`}
                          >
                            <span className="text-[11px] uppercase tracking-wider">{day.slice(0, 3)}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : openCount > 0
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-slate-800 text-slate-500'
                              }`}
                            >
                              {openCount} open
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Slot List for Active Day - Single column wide rows so time never breaks */}
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {activeDaySlots.length === 0 ? (
                        <p className="text-center text-xs text-slate-400 italic py-6 bg-[#0e141d] rounded-xl border border-[#1e293b]">
                          No time slots scheduled on {activeDay}. Please choose another workday above.
                        </p>
                      ) : (
                        activeDaySlots.map((slot) => {
                          const isSelected = selectedSlot?.id === slot.id || (selectedSlot?.day === slot.day && selectedSlot?.time === slot.time);
                          const isBooked = !!slot.isBooked;

                          return (
                            <button
                              key={slot.id || `${slot.day}_${slot.time}`}
                              type="button"
                              disabled={isBooked}
                              onClick={() => {
                                if (!isBooked) {
                                  setSelectedSlot(slot);
                                  setError('');
                                }
                              }}
                              className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between group ${
                                isBooked
                                  ? 'bg-[#0e141d]/50 border-[#1e293b]/70 text-slate-500 cursor-not-allowed opacity-60'
                                  : isSelected
                                  ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/10 border-orange-500 text-white ring-1 ring-orange-500/40 shadow-sm active:scale-[0.99]'
                                  : 'bg-[#0e141d] border-[#1e293b] text-slate-300 hover:text-white hover:border-slate-700 hover:bg-[#141b26] active:scale-[0.99]'
                              }`}
                            >
                              {/* Left: Clock Icon + Time + Duration pill */}
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                                    isBooked
                                      ? 'bg-slate-800/40 border-slate-700/50 text-slate-600'
                                      : isSelected
                                      ? 'bg-orange-500 border-orange-400 text-white shadow-sm'
                                      : 'bg-[#141b26] border-[#1e293b] text-slate-400 group-hover:text-orange-400'
                                  }`}
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                </div>
                                <span className={`whitespace-nowrap font-bold text-xs ${
                                  isBooked ? 'line-through text-slate-500' : isSelected ? 'text-white' : 'text-slate-200'
                                }`}>
                                  {slot.time}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                                  (30 min block)
                                </span>
                              </div>

                              {/* Right: Badge Status */}
                              <div className="shrink-0 ml-3">
                                {isBooked ? (
                                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/25 whitespace-nowrap">
                                    Already Booked
                                  </span>
                                ) : isSelected ? (
                                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-orange-500 text-white flex items-center gap-1 shadow-sm whitespace-nowrap">
                                    <Check className="w-3 h-3" />
                                    <span>Selected</span>
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-semibold text-slate-400 group-hover:text-orange-400 flex items-center gap-1 whitespace-nowrap transition-colors">
                                    <span>Select</span>
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-orange-400" />
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Discussion Topic & Fast Templates */}
              <div className="space-y-2 pt-2 border-t border-[#1e293b]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#f97316]" />
                    <span>2. What would you like to pair on / discuss?</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Required</span>
                </div>

                {/* Quick Topic Prompts */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {QUICK_TOPICS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setTopic(prompt)}
                      className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-[#0e141d] border border-[#1e293b] text-slate-400 hover:text-orange-300 hover:border-orange-500/30 transition-colors"
                    >
                      + {prompt}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Would love to pair on React 19 performance optimizations and walk through our design system architecture..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e141d] border border-[#1e293b] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all resize-none shadow-inner"
                />
              </div>

              {/* Action Bar */}
              <div className="pt-3 border-t border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5 self-start sm:self-center">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Direct Google Meet room link will be generated</span>
                </span>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-[#0e141d] border border-[#1e293b] hover:bg-[#1a2332] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedSlot || selectedSlot.isBooked || isSubmitting}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#f97316] to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white shadow-lg shadow-orange-500/20 transition-all hover:translate-y-[-1px] disabled:opacity-40 disabled:pointer-events-none active:scale-95"
                  >
                    {isSubmitting ? 'Confirming Booking...' : 'Confirm 1:1 Booking'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
