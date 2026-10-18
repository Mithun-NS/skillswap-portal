import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users2, 
  Search, 
  Filter, 
  Sparkles, 
  Calendar, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight,
  Code2,
  Server,
  Cloud,
  Layers,
  ShieldCheck,
  RotateCcw,
  SlidersHorizontal,
  X,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import ColleagueCard from '../components/directory/ColleagueCard';
import BookingModal from '../components/directory/BookingModal';

const DEPARTMENTS = [
  'All Departments',
  'Frontend Engineering',
  'Backend & Core APIs',
  'Cloud Platform & DevOps',
  'QA Automation & Testing',
  'Security & Compliance',
];

const POPULAR_SKILLS = [
  'React.js',
  'Node.js',
  'TypeScript',
  'Python',
  'AWS Cloud',
  'Kubernetes',
  'System Design',
  'Next.js',
  'Docker',
  'Rust',
];

export default function DirectoryPage() {
  const { user: currentUser } = useAuth();

  const [colleagues, setColleagues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('');
  const [onlyWithSlots, setOnlyWithSlots] = useState(false);

  // Booking modal state
  const [bookingColleague, setBookingColleague] = useState(null);

  // Fetch colleagues on mount
  useEffect(() => {
    async function loadColleagues() {
      setIsLoading(true);
      try {
        const data = await api.getUsers();
        if (Array.isArray(data) && data.length > 0) {
          setColleagues(data);
        }
      } catch (err) {
        console.warn('[Directory] Failed to load colleagues:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadColleagues();
  }, []);

  // Filter out the current logged-in user so you only see other colleagues
  const otherColleagues = useMemo(() => {
    if (!currentUser) return colleagues;
    return colleagues.filter(
      (c) => c.id !== currentUser.id && c.email?.toLowerCase() !== currentUser.email?.toLowerCase()
    );
  }, [colleagues, currentUser]);

  // Filter logic
  const filteredColleagues = useMemo(() => {
    return otherColleagues.filter((colleague) => {
      // 1. Department filter
      if (selectedDept !== 'All Departments') {
        const matchesDept = colleague.department?.toLowerCase() === selectedDept.toLowerCase();
        if (!matchesDept) return false;
      }

      // 2. Specific skill filter tag
      if (selectedSkillFilter) {
        const teachSkills = (colleague.skillsToTeach || []).map((s) => s.toLowerCase());
        if (!teachSkills.includes(selectedSkillFilter.toLowerCase())) {
          return false;
        }
      }

      // 3. Only with open slots toggle
      if (onlyWithSlots) {
        const openCount = (colleague.availableSlots || []).filter((s) => !s.isBooked).length;
        if (openCount === 0) return false;
      }

      // 4. Search text query (matches name, role, department, or teach/learn skills)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (colleague.name || '').toLowerCase().includes(q);
        const roleMatch = (colleague.role || '').toLowerCase().includes(q);
        const deptMatch = (colleague.department || '').toLowerCase().includes(q);
        const teachMatch = (colleague.skillsToTeach || []).some((s) => s.toLowerCase().includes(q));
        const learnMatch = (colleague.skillsToLearn || []).some((s) => s.toLowerCase().includes(q));

        if (!nameMatch && !roleMatch && !deptMatch && !teachMatch && !learnMatch) {
          return false;
        }
      }

      return true;
    });
  }, [otherColleagues, selectedDept, selectedSkillFilter, onlyWithSlots, searchQuery]);

  // Overall statistics (excluding self)
  const totalOpenSlots = useMemo(() => {
    return otherColleagues.reduce((total, c) => {
      const open = (c.availableSlots || []).filter((s) => !s.isBooked).length;
      return total + open;
    }, 0);
  }, [otherColleagues]);

  const totalSkillsAvailable = useMemo(() => {
    const all = new Set();
    otherColleagues.forEach((c) => {
      (c.skillsToTeach || []).forEach((s) => all.add(s.toLowerCase()));
    });
    return all.size;
  }, [otherColleagues]);

  // Handle successful booking to update slot status locally
  const handleBookingSuccess = (mentorId, slotId, day, time) => {
    setColleagues((prev) =>
      prev.map((c) => {
        const isMentorMatch = c.id === mentorId || c._id === mentorId;
        if (isMentorMatch && c.availableSlots) {
          const updatedSlots = c.availableSlots.map((s) => {
            const isMatch = (slotId && (s.id === slotId || s._id === slotId)) || 
                            (day && time && s.day?.toLowerCase() === day?.toLowerCase() && s.time === time);
            return isMatch ? { ...s, isBooked: true } : s;
          });
          const updatedColleague = { ...c, availableSlots: updatedSlots };
          setBookingColleague((current) => 
            current && (current.id === mentorId || current._id === mentorId) ? updatedColleague : current
          );
          return updatedColleague;
        }
        return c;
      })
    );
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedDept('All Departments');
    setSelectedSkillFilter('');
    setOnlyWithSlots(false);
  };

  const hasActiveFilters = searchQuery || selectedDept !== 'All Departments' || selectedSkillFilter || onlyWithSlots;

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-12">
      {/* 1. Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#141b26] via-[#16202e] to-[#141b26] border border-[#1e293b] p-6 sm:p-10 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>INTERNAL SKILL EXCHANGE</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Find an internal mentor. Pair on hard problems.{' '}
              <span className="text-[#f97316]">Level up together.</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore expertise across engineering, platform architecture, QA, and cloud. Book real 30-minute 1:1 mentorship blocks synced with colleagues' schedules.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/my-profile"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-[#f97316] hover:bg-orange-500 text-white shadow-md shadow-orange-500/20 transition-all hover:translate-y-[-1px] active:scale-95"
              >
                <span>Configure My Availability Slots</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/talks"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-[#141b26] hover:bg-[#1a2332] text-slate-200 border border-[#1e293b] transition-all hover:translate-y-[-1px] active:scale-95"
              >
                <span>Explore Tech Talks</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3 shrink-0 lg:w-64">
            <div className="p-3.5 rounded-xl bg-[#0e141d]/90 border border-[#1e293b] shadow-sm">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Colleagues</div>
              <div className="text-xl font-bold text-white mt-0.5">{otherColleagues.length}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Active team members</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0e141d]/90 border border-[#1e293b] shadow-sm">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Open Slots</div>
              <div className="text-xl font-bold text-orange-400 mt-0.5">{totalOpenSlots}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">30-min sessions ready</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0e141d]/90 border border-[#1e293b] shadow-sm col-span-2 sm:col-span-1 lg:col-span-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Unique Skills</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">{totalSkillsAvailable}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Topics offered</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Search & Multi-Filter Control Hub */}
      <div className="rounded-2xl bg-[#141b26] border border-[#1e293b] p-5 sm:p-6 shadow-xl space-y-4">
        {/* Row 1: Search Bar & Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search colleagues by name, role, or skill (e.g. React, Kafka, Docker, Rust)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#0e141d] border border-[#1e293b] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Toggle: Only with open slots */}
          <button
            type="button"
            onClick={() => setOnlyWithSlots(!onlyWithSlots)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 shadow-sm ${
              onlyWithSlots
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                : 'bg-[#0e141d] border-[#1e293b] text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${onlyWithSlots ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
            <span>Only with open slots</span>
          </button>
        </div>

        {/* Row 2: Department Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[#1e293b]/70">
          {DEPARTMENTS.map((dept) => {
            const isSelected = selectedDept === dept;
            const count = dept === 'All Departments' 
              ? otherColleagues.length 
              : otherColleagues.filter((c) => c.department?.toLowerCase() === dept.toLowerCase()).length;
            
            return (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#f97316] text-white shadow-sm'
                    : 'bg-[#0e141d] text-slate-400 hover:text-white border border-[#1e293b] hover:bg-[#1a2332]'
                }`}
              >
                <span>{dept}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Row 3: Popular Skill Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Popular Topics:
            </span>
            {POPULAR_SKILLS.map((skill) => {
              const isSelected = selectedSkillFilter.toLowerCase() === skill.toLowerCase();
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => setSelectedSkillFilter(isSelected ? '' : skill)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 active:scale-95 ${
                    isSelected
                      ? 'bg-orange-500 text-white shadow-sm font-semibold'
                      : 'bg-[#0e141d] text-slate-400 hover:text-orange-300 border border-[#1e293b] hover:border-orange-500/30'
                  }`}
                >
                  <span>{skill}</span>
                  {isSelected && <X className="w-3 h-3 ml-0.5" />}
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-xs font-semibold text-slate-400 hover:text-orange-400 flex items-center gap-1 transition-colors active:scale-95 ml-auto"
            >
              <RotateCcw className="w-3 h-3 text-orange-400" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Colleague Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white tracking-tight">
              Colleagues Available for Mentorship & Pairing
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-[#1e293b]">
              {filteredColleagues.length} of {otherColleagues.length}
            </span>
          </div>

          <span className="text-xs text-slate-400">
            Click any colleague to view details or book an open 30-minute block.
          </span>
        </div>

        {isLoading ? (
          /* Loading Skeleton */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="h-64 rounded-2xl bg-[#141b26] border border-[#1e293b] p-6 animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#0e141d]"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-3.5 bg-[#0e141d] rounded w-3/4"></div>
                    <div className="h-2.5 bg-[#0e141d] rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-12 bg-[#0e141d] rounded"></div>
                <div className="h-6 bg-[#0e141d] rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredColleagues.length === 0 ? (
          /* Empty State */
          <div className="p-12 rounded-2xl bg-[#141b26] border border-[#1e293b] text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center mx-auto">
              <Users2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                No colleagues match your current search or filters
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Try clearing your search query or selecting a different department or skill filter.
              </p>
            </div>
            <button
              type="button"
              onClick={resetAllFilters}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#f97316] hover:bg-orange-500 text-white transition-all shadow-md shadow-orange-500/20 active:scale-95"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          /* Grid of Colleague Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredColleagues.map((colleague) => (
              <ColleagueCard
                key={colleague.id}
                colleague={colleague}
                isCurrentUser={currentUser?.id === colleague.id || currentUser?.email === colleague.email}
                onBookSession={(c) => setBookingColleague(c)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 4. Booking Modal */}
      {bookingColleague && (
        <BookingModal
          colleague={bookingColleague}
          onClose={() => setBookingColleague(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}
