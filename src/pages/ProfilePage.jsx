import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  User, 
  Mail, 
  Briefcase, 
  Clock, 
  Sparkles, 
  BookOpen, 
  Plus, 
  X, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  Code2,
  Server,
  Cloud,
  ShieldCheck,
  Cpu,
  Layers,
  Compass,
  ChevronDown,
  Check,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = [
  {
    id: 'frontend',
    name: 'Frontend Engineering',
    desc: 'React, Design Systems & Client Architecture',
    icon: Code2,
  },
  {
    id: 'backend',
    name: 'Backend & Core APIs',
    desc: 'Distributed Microservices, Node.js & Datastores',
    icon: Server,
  },
  {
    id: 'cloud',
    name: 'Cloud Platform & DevOps',
    desc: 'Kubernetes, AWS, Terraform & CI/CD Pipelines',
    icon: Cloud,
  },
  {
    id: 'qa',
    name: 'QA Automation & Testing',
    desc: 'E2E Testing, Cypress, Playwright & Quality Ops',
    icon: Layers,
  },
  {
    id: 'security',
    name: 'Security & Compliance',
    desc: 'Identity, AppSec, Threat Modeling & Audits',
    icon: ShieldCheck,
  },
  {
    id: 'data',
    name: 'Data Engineering & ML',
    desc: 'Pipelines, Spark, Kafka, Python & Model Serving',
    icon: Cpu,
  },
  {
    id: 'product',
    name: 'Product Management & UX',
    desc: 'Discovery, Technical Specs & Design Systems',
    icon: Compass,
  },
];

const SUGGESTED_TEACH_SKILLS = [
  'React', 'TypeScript', 'Node.js', 'System Design', 'Docker',
  'Kubernetes', 'GraphQL', 'PostgreSQL', 'Microservices', 'CI/CD Pipelines',
  'Python', 'AWS Cloud', 'Next.js', 'Clean Architecture', 'Testing'
];

const SUGGESTED_LEARN_SKILLS = [
  'Rust', 'Go (Golang)', 'Distributed Systems', 'Kafka', 'Terraform',
  'AI & LLM Integration', 'WebAssembly', 'Event-Driven Architecture', 'gRPC', 'Redis'
];

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  // Form states
  const [name, setName] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0].name);
  const [role, setRole] = useState('');
  const [experienceYears, setExperienceYears] = useState(2);
  const [bio, setBio] = useState('');
  const [skillsToTeach, setSkillsToTeach] = useState([]);
  const [skillsToLearn, setSkillsToLearn] = useState([]);

  // Custom Dropdown State
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const deptDropdownRef = useRef(null);

  // Custom Tag Inputs
  const [teachInput, setTeachInput] = useState('');
  const [learnInput, setLearnInput] = useState('');

  // Status & Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Close department dropdown on outside click, scroll, or Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(event.target)) {
        setIsDeptDropdownOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsDeptDropdownOpen(false);
      }
    }

    function handleScroll(event) {
      if (deptDropdownRef.current && deptDropdownRef.current.contains(event.target)) {
        return;
      }
      setIsDeptDropdownOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  // Sync form state when user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setDepartment(user.department || DEPARTMENTS[0].name);
      setRole(user.role || '');
      setExperienceYears(typeof user.experienceYears === 'number' ? user.experienceYears : 2);
      setBio(user.bio || '');
      setSkillsToTeach(Array.isArray(user.skillsToTeach) ? user.skillsToTeach : []);
      setSkillsToLearn(Array.isArray(user.skillsToLearn) ? user.skillsToLearn : []);
    }
  }, [user]);

  // Initials calculation
  const initials = useMemo(() => {
    if (!name.trim()) return 'ME';
    return name
      .trim()
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }, [name]);

  // Selected department object
  const currentDeptObj = useMemo(() => {
    return DEPARTMENTS.find((d) => d.name === department) || DEPARTMENTS[0];
  }, [department]);

  // Dirty state tracking
  const isDirty = useMemo(() => {
    if (!user) return false;
    return (
      name !== (user.name || '') ||
      department !== (user.department || DEPARTMENTS[0].name) ||
      role !== (user.role || '') ||
      experienceYears !== (user.experienceYears ?? 2) ||
      bio !== (user.bio || '') ||
      JSON.stringify(skillsToTeach) !== JSON.stringify(user.skillsToTeach || []) ||
      JSON.stringify(skillsToLearn) !== JSON.stringify(user.skillsToLearn || [])
    );
  }, [user, name, department, role, experienceYears, bio, skillsToTeach, skillsToLearn]);

  // Tag Handlers - Teach
  const handleAddTeachSkill = (skill) => {
    const trimmed = (skill || teachInput).trim();
    if (!trimmed) return;
    if (!skillsToTeach.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkillsToTeach([...skillsToTeach, trimmed]);
    }
    setTeachInput('');
  };

  const handleRemoveTeachSkill = (skillToRemove) => {
    setSkillsToTeach(skillsToTeach.filter((s) => s !== skillToRemove));
  };

  // Tag Handlers - Learn
  const handleAddLearnSkill = (skill) => {
    const trimmed = (skill || learnInput).trim();
    if (!trimmed) return;
    if (!skillsToLearn.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkillsToLearn([...skillsToLearn, trimmed]);
    }
    setLearnInput('');
  };

  const handleRemoveLearnSkill = (skillToRemove) => {
    setSkillsToLearn(skillsToLearn.filter((s) => s !== skillToRemove));
  };

  // Reset form
  const handleReset = () => {
    if (!user) return;
    setName(user.name || '');
    setDepartment(user.department || DEPARTMENTS[0].name);
    setRole(user.role || '');
    setExperienceYears(typeof user.experienceYears === 'number' ? user.experienceYears : 2);
    setBio(user.bio || '');
    setSkillsToTeach(user.skillsToTeach || []);
    setSkillsToLearn(user.skillsToLearn || []);
    setStatusMessage({ type: '', text: '' });
  };

  // Save changes
  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatusMessage({ type: 'error', text: 'Full Name cannot be empty.' });
      return;
    }
    if (!role.trim()) {
      setStatusMessage({ type: 'error', text: 'Job Title / Designation cannot be empty.' });
      return;
    }

    setIsSaving(true);
    setStatusMessage({ type: '', text: '' });

    const updates = {
      name: name.trim(),
      department: department.trim(),
      role: role.trim(),
      experienceYears: Math.max(0, parseInt(experienceYears, 10) || 0),
      bio: bio.trim(),
      skillsToTeach,
      skillsToLearn,
    };

    const res = await updateProfile(updates);
    setIsSaving(false);

    if (res.success) {
      setStatusMessage({ type: 'success', text: 'Profile changes saved successfully.' });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Failed to update profile.' });
    }
  };

  const DeptIcon = currentDeptObj.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-8">
      {/* 1. Header & Live Profile Strength Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#141b26] via-[#16202e] to-[#141b26] border border-[#1e293b] p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* Monogram Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#f97316] via-orange-600 to-amber-600 flex items-center justify-center text-xl sm:text-2xl font-black text-white shadow-lg shadow-orange-500/10 ring-2 ring-orange-500/20 shrink-0">
              {initials}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {name || 'Your Name'}
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[11px] font-semibold">
                  Mentor Profile
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                {role || 'Senior Software Engineer'}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5 text-slate-300">
                  <DeptIcon className="w-3.5 h-3.5 text-[#f97316]" />
                  <span>{department}</span>
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">{user?.email}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300 font-semibold">{experienceYears || 0} years experience</span>
              </div>
            </div>
          </div>

          {/* Mentorship Capacity & Slot Management Shortcut */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-[#0e141d]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-[#1e293b] flex items-center gap-3.5 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[#f97316] flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium">Weekly Capacity:</span>
                  <span className="text-orange-400 font-semibold">{user?.weeklySessionCap || 2} sessions per week</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {(user?.availableSlots?.length || 0) > 0 
                    ? `${user.availableSlots.length} active time slots configured`
                    : 'No calendar slots configured yet'}
                </p>
              </div>
            </div>

            <Link
              to="/bookings"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#141b26] hover:bg-[#1a2332] border border-[#1e293b] text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm group active:scale-95 shrink-0"
              title="Configure availability slots and view booked sessions"
            >
              <Calendar className="w-3.5 h-3.5 text-orange-400 group-hover:scale-110 transition-transform" />
              <span>Manage Slots</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Status Feedback Alerts */}
      {statusMessage.text && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-3 animate-in fade-in duration-150 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 shadow-sm'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300 shadow-sm'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span className="font-semibold text-sm leading-tight">{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Professional Identity Details */}
        <div className="rounded-2xl bg-[#141b26] border border-[#1e293b] p-6 sm:p-8 shadow-xl space-y-6">
          <div className="border-b border-[#1e293b] pb-4">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#f97316]" />
              <span>Role & Engineering Squad</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Defines your department grouping and primary technical focus area.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mithun NS"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0e141d] border border-[#1e293b] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/50 transition-all"
                />
              </div>
            </div>

            {/* Corporate Email (Read-only) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Corporate Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0a0e15] border border-[#1e293b] text-sm text-slate-400 cursor-not-allowed select-none"
                />
              </div>
            </div>

            {/* CUSTOM DEPARTMENT DROPDOWN (Replaces raw native OS <select>) */}
            <div className="relative" ref={deptDropdownRef}>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Department / Squad <span className="text-rose-400">*</span>
              </label>

              {/* Custom Dropdown Trigger Button */}
              <button
                type="button"
                onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#0e141d] border text-sm text-white transition-all text-left ${
                  isDeptDropdownOpen
                    ? 'border-[#f97316] ring-1 ring-[#f97316]/40 shadow-lg'
                    : 'border-[#1e293b] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-orange-500/10 text-[#f97316] flex items-center justify-center shrink-0 border border-orange-500/20">
                    <DeptIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium text-sm text-white truncate">{department}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isDeptDropdownOpen ? 'rotate-180 text-orange-400' : ''
                  }`}
                />
              </button>

              {/* Custom Dark-Glass Dropdown Menu */}
              {isDeptDropdownOpen && (
                <div className="absolute left-0 right-0 mt-2 z-50 max-h-60 overflow-y-auto rounded-2xl bg-[#141b26] border border-[#1e293b] shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                  {DEPARTMENTS.map((deptItem) => {
                    const ItemIcon = deptItem.icon;
                    const isSelected = deptItem.name === department;
                    return (
                      <button
                        key={deptItem.id}
                        type="button"
                        onClick={() => {
                          setDepartment(deptItem.name);
                          setIsDeptDropdownOpen(false);
                        }}
                        className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all group ${
                          isSelected
                            ? 'bg-[#f97316]/15 border border-[#f97316]/30 text-white'
                            : 'hover:bg-[#1a2332] text-slate-300 hover:text-white'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                            isSelected
                              ? 'bg-orange-500 text-white border-orange-400 shadow-sm'
                              : 'bg-[#0e141d] text-slate-400 group-hover:text-orange-400 border-[#1e293b]'
                          }`}
                        >
                          <ItemIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold tracking-tight">{deptItem.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-orange-400 shrink-0" />}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-tight mt-0.5 truncate">
                            {deptItem.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Job Title / Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Job Title / Designation <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0e141d] border border-[#1e293b] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/50 transition-all"
                />
              </div>
            </div>

            {/* Clean Experience Stepper (No native browser spinner arrows) */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Total Industry Experience
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center rounded-xl bg-[#0e141d] border border-[#1e293b] overflow-hidden focus-within:border-[#f97316] focus-within:ring-1 focus-within:ring-[#f97316]/50 transition-all shadow-inner">
                  <button
                    type="button"
                    onClick={() => setExperienceYears(Math.max(0, (parseInt(experienceYears, 10) || 0) - 1))}
                    className="w-9 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#141b26] transition-colors text-base font-bold select-none border-r border-[#1e293b]"
                    title="Decrease years"
                  >
                    −
                  </button>
                  <div className="flex items-center gap-1 px-3">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={experienceYears}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setExperienceYears(val === '' ? '' : parseInt(val, 10));
                      }}
                      className="w-8 text-center bg-transparent text-sm font-bold text-white focus:outline-none"
                    />
                    <span className="text-xs text-slate-400 font-medium">years</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExperienceYears((parseInt(experienceYears, 10) || 0) + 1)}
                    className="w-9 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#141b26] transition-colors text-base font-bold select-none border-l border-[#1e293b]"
                    title="Increase years"
                  >
                    +
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5">
                  {[1, 3, 5, 8, 10].map((yr) => {
                    const isSelected = parseInt(experienceYears, 10) === yr;
                    return (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setExperienceYears(yr)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-[#f97316] border-[#f97316] text-white shadow-sm'
                            : 'bg-[#0e141d] border-[#1e293b] text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {yr}+ yrs
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mentorship Philosophy / Bio */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  About Me & Pairing Philosophy
                </label>
                <span className="text-[11px] text-slate-500 font-mono">{bio.length}/500</span>
              </div>
              <textarea
                rows={3}
                maxLength={500}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share what topics you love discussing, your architectural interests, and how you like to collaborate during 1:1 sessions..."
                className="w-full p-3.5 rounded-xl bg-[#0e141d] border border-[#1e293b] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/50 transition-all resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Interactive Skill Matrix (The WOW Factor) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card A: Skills I Can Mentor In (Sunset Amber) */}
          <div className="rounded-2xl bg-gradient-to-b from-[#182130] to-[#141b26] border border-[#1e293b] p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-orange-500/30 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#f97316]/15 text-[#f97316] border border-[#f97316]/30 flex items-center justify-center shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">Skills I Can Mentor In</h3>
                    <p className="text-[11px] text-slate-400">Topics colleagues can book sessions with you for.</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#f97316]/15 text-[#f97316] border border-[#f97316]/30">
                  {skillsToTeach.length}
                </span>
              </div>

              {/* Add Input */}
              <div className="flex gap-2 my-3">
                <input
                  type="text"
                  value={teachInput}
                  onChange={(e) => setTeachInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTeachSkill();
                    }
                  }}
                  placeholder="e.g. React, Docker, System Design..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0e141d] border border-[#1e293b] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleAddTeachSkill()}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#f97316] hover:bg-[#ea580c] text-white transition-all flex items-center gap-1 shadow-sm shrink-0 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Active Chips */}
              <div className="min-h-[80px] p-3 rounded-xl bg-[#0e141d]/80 border border-[#1e293b] flex flex-wrap gap-2 items-start">
                {skillsToTeach.length === 0 ? (
                  <span className="text-xs text-slate-500 italic p-1">
                    No mentoring skills added yet. Add tags above or click quick suggestions below.
                  </span>
                ) : (
                  skillsToTeach.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-orange-500/15 to-amber-500/10 text-orange-300 border border-orange-500/30 group hover:border-orange-500/60 transition-all shadow-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTeachSkill(skill)}
                        className="text-orange-400 hover:text-white rounded p-0.5 hover:bg-orange-500/20 transition-colors"
                        title={`Remove ${skill}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Popular Suggestions */}
            <div className="pt-3 border-t border-[#1e293b]/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Popular Mentorship Topics
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_TEACH_SKILLS.filter((s) => !skillsToTeach.includes(s))
                  .slice(0, 6)
                  .map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleAddTeachSkill(suggestion)}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#0e141d] border border-[#1e293b] text-slate-400 hover:text-orange-400 hover:border-orange-500/40 hover:bg-orange-500/5 transition-all flex items-center gap-1 active:scale-95"
                    >
                      <Plus className="w-2.5 h-2.5 text-orange-400" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Card B: Skills I Want to Learn (Forest Sage / Emerald) */}
          <div className="rounded-2xl bg-gradient-to-b from-[#182522] to-[#141b26] border border-[#1e293b] p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-sm">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">Skills I'm Learning</h3>
                    <p className="text-[11px] text-slate-400">Topics you're seeking mentorship or pairing on.</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {skillsToLearn.length}
                </span>
              </div>

              {/* Add Input */}
              <div className="flex gap-2 my-3">
                <input
                  type="text"
                  value={learnInput}
                  onChange={(e) => setLearnInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLearnSkill();
                    }
                  }}
                  placeholder="e.g. Rust, Kafka, Kubernetes..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0e141d] border border-[#1e293b] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleAddLearnSkill()}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-1 shadow-sm shrink-0 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Active Chips */}
              <div className="min-h-[80px] p-3 rounded-xl bg-[#0e141d]/80 border border-[#1e293b] flex flex-wrap gap-2 items-start">
                {skillsToLearn.length === 0 ? (
                  <span className="text-xs text-slate-500 italic p-1">
                    No learning goals added yet. Add what you are exploring to match with mentors.
                  </span>
                ) : (
                  skillsToLearn.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-500/15 to-teal-500/10 text-emerald-300 border border-emerald-500/30 group hover:border-emerald-500/60 transition-all shadow-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLearnSkill(skill)}
                        className="text-emerald-400 hover:text-white rounded p-0.5 hover:bg-emerald-500/20 transition-colors"
                        title={`Remove ${skill}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Popular Suggestions */}
            <div className="pt-3 border-t border-[#1e293b]/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                High-Demand Learning Topics
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_LEARN_SKILLS.filter((s) => !skillsToLearn.includes(s))
                  .slice(0, 6)
                  .map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleAddLearnSkill(suggestion)}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#0e141d] border border-[#1e293b] text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all flex items-center gap-1 active:scale-95"
                    >
                      <Plus className="w-2.5 h-2.5 text-emerald-400" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="rounded-2xl bg-[#141b26] border border-[#1e293b] p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {isDirty ? (
              <span className="inline-flex items-center gap-2 text-xs text-amber-400 font-semibold px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                You have unsaved profile changes
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-xs text-slate-400 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                All changes saved
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={!isDirty || isSaving}
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#0e141d] hover:bg-[#1a2332] text-slate-300 hover:text-white border border-[#1e293b] transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard Changes</span>
            </button>

            <button
              type="submit"
              disabled={!isDirty || isSaving}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#f97316] to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white shadow-lg shadow-orange-500/20 transition-all hover:translate-y-[-1px] active:scale-95 flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
