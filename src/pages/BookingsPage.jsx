import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarCheck, 
  Search, 
  Filter, 
  Users, 
  GraduationCap, 
  ShieldCheck, 
  History, 
  Plus, 
  Sparkles, 
  RefreshCw,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import SessionStats from '../components/bookings/SessionStats';
import SessionCard from '../components/bookings/SessionCard';
import CancelSessionModal from '../components/bookings/CancelSessionModal';
import CompleteSessionModal from '../components/bookings/CompleteSessionModal';

export default function BookingsPage() {
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'attending', 'hosting', 'history'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'confirmed', 'completed', 'cancelled'

  // Modals state
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [completingBooking, setCompletingBooking] = useState(null);
  const [completionContext, setCompletionContext] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUserId = currentUser?.id || currentUser?._id;
  const currentUserEmail = currentUser?.email || '';
  const currentUserName = currentUser?.name || '';

  const clean = (val) => (val || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');
  const normName = clean(currentUserName);
  const normEmail = clean(currentUserEmail);
  const normId = clean(currentUserId);

  // Helper match functions (supporting ID, email, and name)
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

  const isUserSession = (b) => isMentee(b) || isMentor(b);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await api.getBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      toast.error('Failed to sync sessions from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filtered bookings based on user, activeTab, statusFilter, and search query
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // 1. Tab check
      if (activeTab === 'attending' && !isMentee(b)) return false;
      if (activeTab === 'hosting' && !isMentor(b)) return false;
      if (activeTab === 'history') {
        const isHistory = b.status === 'completed' || b.status === 'cancelled';
        if (!isHistory) return false;
      }

      // 2. Status filter chip
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTopic = b.topic?.toLowerCase().includes(q);
        const matchesMentor = b.mentorName?.toLowerCase().includes(q);
        const matchesMentee = b.menteeName?.toLowerCase().includes(q);
        const matchesDay = b.day?.toLowerCase().includes(q);
        const matchesNotes = b.notes?.toLowerCase().includes(q);
        if (!matchesTopic && !matchesMentor && !matchesMentee && !matchesDay && !matchesNotes) {
          return false;
        }
      }

      return true;
    });
  }, [bookings, activeTab, statusFilter, searchQuery, currentUserId, currentUserEmail]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: bookings.length,
      attending: bookings.filter(isMentee).length,
      hosting: bookings.filter(isMentor).length,
      history: bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled').length,
    };
  }, [bookings, currentUserId, currentUserEmail]);

  // Handle Cancel Booking
  const handleConfirmCancel = async (reason) => {
    if (!cancellingBooking) return;
    setIsSubmitting(true);
    try {
      await api.cancelBooking(cancellingBooking.id, reason);
      toast.success('Session cancelled and slot freed up for other colleagues.');
      setCancellingBooking(null);
      await fetchBookings();
      // Dispatch storage change event for Navbar badge sync
      window.dispatchEvent(new Event('skillswap:storage_change'));
    } catch (err) {
      toast.error(err.message || 'Failed to cancel session');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Complete Booking
  const handleConfirmComplete = async (feedbackNote) => {
    if (!completingBooking) return;
    setIsSubmitting(true);
    try {
      await api.completeBooking(completingBooking.id, feedbackNote);
      toast.success('Session marked completed! Knowledge credits logged.');
      setCompletingBooking(null);
      await fetchBookings();
      window.dispatchEvent(new Event('skillswap:storage_change'));
    } catch (err) {
      toast.error(err.message || 'Failed to complete session');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Booking
  const handleDeleteBooking = async (booking) => {
    try {
      const id = booking.id || booking._id;
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete session');
      toast.success('Session record removed.');
      await fetchBookings();
      window.dispatchEvent(new Event('skillswap:storage_change'));
    } catch (err) {
      toast.error(err.message || 'Failed to remove session');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#141b26] via-[#16202e] to-[#141b26] border border-[#1e293b] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <CalendarCheck className="w-3.5 h-3.5" />
            Session Management Cockpit
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Mentorship & Pairing Schedule
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Manage upcoming 1:1 sessions, join Google Meet pairing rooms, export .ics invites to Outlook, and review completed engineering knowledge exchanges.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchBookings}
            disabled={loading}
            title="Refresh Sessions"
            className="p-2.5 rounded-xl bg-[#0e141d] hover:bg-slate-800 border border-[#1e293b] text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-400' : ''}`} />
          </button>
          <Link
            to="/"
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Book a Colleague
          </Link>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <SessionStats
        bookings={bookings}
        currentUserId={currentUserId}
        currentUserEmail={currentUserEmail}
        currentUserName={currentUserName}
      />

      {/* Controls: Search, Tabs & Status Filter */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#141b26] border border-[#1e293b] shadow-md space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Main View Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#0e141d] p-1.5 rounded-xl border border-[#1e293b]">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'all'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              All Sessions
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'all' ? 'bg-black/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {tabCounts.all}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('attending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'attending'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Attending (Mentee)
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'attending' ? 'bg-black/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {tabCounts.attending}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('hosting')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'hosting'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Hosting (Mentor)
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'hosting' ? 'bg-black/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {tabCounts.hosting}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Completed & History
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'history' ? 'bg-black/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {tabCounts.history}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by colleague, topic, day..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0e141d] border border-[#1e293b] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Sub-filter chips: Status */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1e293b]">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-orange-400" />
            Status:
          </span>
          {[
            { id: 'all', label: 'All Status' },
            { id: 'confirmed', label: 'Upcoming Only' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setStatusFilter(chip.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                statusFilter === chip.id
                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                  : 'bg-[#0e141d] text-slate-400 hover:text-slate-200 border border-[#1e293b]'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List Section */}
      {loading ? (
        <div className="p-12 text-center rounded-2xl bg-[#141b26] border border-[#1e293b]">
          <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-medium">Syncing sessions from MongoDB Atlas...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#141b26] border border-[#1e293b] space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white">No Sessions Found</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {searchQuery
                ? `No sessions match "${searchQuery}". Try clearing search or switching tabs.`
                : activeTab === 'attending'
                ? "You haven't booked any mentorship sessions yet. Explore the colleague directory to schedule 1:1 pairing!"
                : activeTab === 'hosting'
                ? "No colleagues have booked sessions with you yet. Make sure your availability slots are open in your profile!"
                : 'No sessions scheduled in this view.'}
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800"
              >
                Clear Search
              </button>
            )}
            <Link
              to="/"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors inline-flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              Explore Colleague Directory
            </Link>
            <Link
              to="/profile"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#0e141d] border border-[#1e293b] hover:border-slate-700 transition-colors inline-flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
              Configure My Slots
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <SessionCard
              key={booking.id || booking._id}
              booking={booking}
              currentUserId={currentUserId}
              currentUserEmail={currentUserEmail}
              currentUserName={currentUserName}
              onCancel={(b) => setCancellingBooking(b)}
              onComplete={(b, ctx) => {
                setCompletingBooking(b);
                setCompletionContext(ctx || {});
              }}
              onDelete={(b) => handleDeleteBooking(b)}
            />
          ))}
        </div>
      )}

      {/* Cancel Session Modal */}
      {cancellingBooking && (
        <CancelSessionModal
          booking={cancellingBooking}
          onClose={() => setCancellingBooking(null)}
          onConfirm={handleConfirmCancel}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Complete Session Modal */}
      {completingBooking && (
        <CompleteSessionModal
          booking={completingBooking}
          onClose={() => {
            setCompletingBooking(null);
            setCompletionContext({});
          }}
          onConfirm={handleConfirmComplete}
          isSubmitting={isSubmitting}
          hasJoinedMeet={completionContext.hasJoinedMeet}
          onJoinMeet={completionContext.onJoinMeet}
        />
      )}
    </div>
  );
}
