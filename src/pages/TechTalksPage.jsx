import React, { useState, useEffect, useMemo } from 'react';
import { 
  Presentation, 
  Plus, 
  Search, 
  Filter, 
  BookmarkCheck, 
  Mic, 
  History, 
  RefreshCw, 
  Sparkles,
  Layers,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import TechTalkStats from '../components/talks/TechTalkStats';
import TechTalkCard from '../components/talks/TechTalkCard';
import ProposeTalkModal from '../components/talks/ProposeTalkModal';
import CustomDropdown from '../components/talks/CustomDropdown';

export default function TechTalksPage() {
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [talks, setTalks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'attending', 'hosting', 'archive'
  const [selectedLevel, setSelectedLevel] = useState('all'); // 'all', 'Beginner', 'Intermediate', 'Advanced'
  const [selectedDept, setSelectedDept] = useState('all');
  const [isProposeOpen, setIsProposeOpen] = useState(false);

  const currentUserEmail = (currentUser?.email || '').trim().toLowerCase();
  const currentUserName = (currentUser?.name || '').trim().toLowerCase();

  const fetchTalksAndUsers = async () => {
    try {
      setLoading(true);
      const [talksData, usersData] = await Promise.all([
        api.getTalks(),
        api.getUsers()
      ]);
      setTalks(Array.isArray(talksData) ? talksData : []);
      setAllUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error('Failed to load tech talks:', err);
      toast.error('Failed to sync tech talks from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTalksAndUsers();
  }, []);

  // Distinct departments for filter
  const departments = useMemo(() => {
    const set = new Set();
    talks.forEach((t) => {
      if (t.department) set.add(t.department);
    });
    return Array.from(set);
  }, [talks]);

  const levelOptions = [
    { value: 'all', label: 'All Difficulty Levels' },
    { value: 'Beginner', label: 'Beginner', dotColor: 'bg-emerald-400' },
    { value: 'Intermediate', label: 'Intermediate', dotColor: 'bg-amber-400' },
    { value: 'Advanced', label: 'Advanced', dotColor: 'bg-rose-400' },
  ];

  const departmentOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Departments' },
      ...departments.map((d) => ({ value: d, label: d })),
    ];
  }, [departments]);

  // Today's date string for splitting upcoming vs archive
  const todayStr = new Date().toISOString().split('T')[0];

  // Filtered talks logic
  const filteredTalks = useMemo(() => {
    return talks.filter((t) => {
      const attendees = Array.isArray(t.attendees) ? t.attendees : [];
      const isAttending = attendees.some(
        (e) => (e || '').toString().trim().toLowerCase() === currentUserEmail
      );
      const isSpeaker =
        (t.speakerEmail || '').trim().toLowerCase() === currentUserEmail ||
        (t.speakerName || '').trim().toLowerCase() === currentUserName;

      const isPast = t.date && t.date < todayStr;

      // 1. Tab filtering
      if (activeTab === 'attending' && !isAttending) return false;
      if (activeTab === 'hosting' && !isSpeaker) return false;
      if (activeTab === 'archive' && !isPast) return false;
      if (activeTab === 'all' && isPast) return false; // Show upcoming on 'all' tab

      // 2. Level filter
      if (selectedLevel !== 'all' && t.level?.toLowerCase() !== selectedLevel.toLowerCase()) {
        return false;
      }

      // 3. Department filter
      if (selectedDept !== 'all' && t.department !== selectedDept) {
        return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = t.title?.toLowerCase().includes(q);
        const matchAbstract = t.abstract?.toLowerCase().includes(q);
        const matchSpeaker = t.speakerName?.toLowerCase().includes(q);
        const matchDept = t.department?.toLowerCase().includes(q);
        if (!matchTitle && !matchAbstract && !matchSpeaker && !matchDept) {
          return false;
        }
      }

      return true;
    });
  }, [talks, activeTab, selectedLevel, selectedDept, searchQuery, currentUserEmail, currentUserName, todayStr]);

  // Handle RSVP toggle
  const handleToggleRsvp = async (talkId) => {
    if (!currentUserEmail) {
      toast.warning('Please log in to RSVP for tech talks');
      return;
    }

    try {
      const isNowAttending = await api.toggleTalkRsvp(talkId, currentUserEmail);
      // Optimistic state update
      setTalks((prev) =>
        prev.map((t) => {
          if (t.id === talkId) {
            const list = Array.isArray(t.attendees) ? [...t.attendees] : [];
            const idx = list.indexOf(currentUserEmail);
            if (isNowAttending) {
              if (idx < 0) list.push(currentUserEmail);
            } else {
              if (idx >= 0) list.splice(idx, 1);
            }
            return { ...t, attendees: list };
          }
          return t;
        })
      );

      if (isNowAttending) {
        toast.success("RSVP Confirmed! We've saved your spot.");
      } else {
        toast.info('RSVP cancelled for this session.');
      }
    } catch (err) {
      console.error('RSVP toggle failed:', err);
      toast.error('Failed to update RSVP. Please try again.');
    }
  };

  // Handle Delete talk
  const handleDeleteTalk = async (talkId) => {
    try {
      await api.deleteTalk(talkId);
      setTalks((prev) => prev.filter((t) => t.id !== talkId));
      toast.success('Tech talk cancelled and removed.');
    } catch (err) {
      console.error('Failed to delete talk:', err);
      toast.error('Failed to delete talk.');
    }
  };

  // Handle Propose talk
  const handleProposeTalk = async (talkData) => {
    try {
      const created = await api.addTalk(talkData);
      setTalks((prev) => [created, ...prev]);
      toast.success('Your tech talk proposal has been published live!');
    } catch (err) {
      console.error('Failed to add talk:', err);
      throw err;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#141b26] via-[#1a2333] to-[#141b26] border border-[#1e293b] shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20 shadow-inner">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                Tech Talks & Workshops Hub
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  Live
                </span>
              </h1>
              <p className="text-xs text-slate-300">
                Peer-to-peer lightning talks, brown-bag demos, architectural deep-dives, and RSVP calendar sync.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={fetchTalksAndUsers}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Refresh talks feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsProposeOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-600 hover:from-orange-600 hover:to-indigo-700 shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Propose a Tech Talk
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <TechTalkStats talks={talks} currentUser={currentUser} />

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#141b26] border border-[#1e293b] space-y-4 shadow-md">
        {/* Row 1: Tab Navigation */}
        <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Upcoming Talks
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('attending')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'attending'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              My RSVPs
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('hosting')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'hosting'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              Hosting (Speaker)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('archive')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'archive'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Past Archive
            </button>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Showing <span className="text-white font-bold">{filteredTalks.length}</span> session
            {filteredTalks.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Row 2: Search Input & Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, presentation title, speaker name, or department..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-500 text-xs transition-all"
            />
          </div>

          {/* Custom Level Dropdown */}
          <div className="sm:col-span-3">
            <CustomDropdown
              value={selectedLevel}
              onChange={setSelectedLevel}
              options={levelOptions}
              icon={Layers}
            />
          </div>

          {/* Custom Department Dropdown */}
          <div className="sm:col-span-3">
            <CustomDropdown
              value={selectedDept}
              onChange={setSelectedDept}
              options={departmentOptions}
              icon={Filter}
            />
          </div>
        </div>
      </div>

      {/* Talks Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading scheduled tech talks & workshops...</p>
        </div>
      ) : filteredTalks.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-[#141b26] border border-[#1e293b] p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Tech Talks Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              {searchQuery || selectedLevel !== 'all' || selectedDept !== 'all'
                ? 'No presentations match your search criteria or filter tags. Try clearing your filters.'
                : activeTab === 'attending'
                ? "You haven't RSVP'd to any upcoming talks yet. Browse upcoming sessions and join your peers!"
                : activeTab === 'hosting'
                ? "You haven't proposed or hosted any tech talks yet. Pitch a topic to share your knowledge!"
                : 'No tech talks have been scheduled yet.'}
            </p>
          </div>
          <div className="pt-2">
            {searchQuery || selectedLevel !== 'all' || selectedDept !== 'all' ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedLevel('all');
                  setSelectedDept('all');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
              >
                Clear Filters
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsProposeOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-indigo-600 hover:from-orange-600 hover:to-indigo-700 shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                Propose the First Talk
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTalks.map((talk) => (
            <TechTalkCard
              key={talk.id}
              talk={talk}
              currentUser={currentUser}
              onToggleRsvp={handleToggleRsvp}
              onDeleteTalk={handleDeleteTalk}
              allUsers={allUsers}
            />
          ))}
        </div>
      )}

      {/* Propose Talk Modal */}
      <ProposeTalkModal
        isOpen={isProposeOpen}
        onClose={() => setIsProposeOpen(false)}
        onSubmit={handleProposeTalk}
        currentUser={currentUser}
      />
    </div>
  );
}
