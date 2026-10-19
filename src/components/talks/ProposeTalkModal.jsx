import React, { useState } from 'react';
import { 
  X, 
  Presentation, 
  Sparkles, 
  Calendar, 
  Clock, 
  Video, 
  FileText, 
  User, 
  Layers, 
  Info,
  Check,
  Zap,
  Mic,
  Wrench
} from 'lucide-react';
import CustomDatePicker from './CustomDatePicker';

export default function ProposeTalkModal({ isOpen, onClose, onSubmit, currentUser }) {
  if (!isOpen) return null;

  // Calculate default date = 5 days in the future
  const getDefaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [level, setLevel] = useState('Intermediate');
  const [date, setDate] = useState(getDefaultDate());
  const [time, setTime] = useState('04:00 PM - 04:45 PM');
  const [duration, setDuration] = useState('45 Mins (Tech Talk & Q&A)');
  const [meetingUrl, setMeetingUrl] = useState('https://meet.google.com/new');
  const [slidesUrl, setSlidesUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const levels = [
    {
      id: 'Beginner',
      label: 'Beginner',
      desc: 'Foundations & introductory walkthroughs',
      color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    },
    {
      id: 'Intermediate',
      label: 'Intermediate',
      desc: 'Practical patterns & real-world workflows',
      color: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
    },
    {
      id: 'Advanced',
      label: 'Advanced',
      desc: 'Deep dives, scaling & system internals',
      color: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
    },
  ];

  const durationFormats = [
    {
      id: '30 Mins (Quick Demo & Discussion)',
      label: '30 Mins',
      sublabel: 'Quick Demo & Discussion',
      icon: Zap,
    },
    {
      id: '45 Mins (Tech Talk & Q&A)',
      label: '45 Mins',
      sublabel: 'Tech Talk & Q&A',
      icon: Mic,
    },
    {
      id: '60 Mins (Hands-on Workshop)',
      label: '60 Mins',
      sublabel: 'Hands-on Workshop',
      icon: Wrench,
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide a compelling talk title.');
      return;
    }
    if (!abstract.trim() || abstract.trim().length < 15) {
      setError('Please provide an abstract or key takeaways (at least 15 characters).');
      return;
    }
    if (!date) {
      setError('Please select a presentation date.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newTalk = {
        title: title.trim(),
        abstract: abstract.trim(),
        speakerName: currentUser?.name || 'Engineer',
        speakerEmail: currentUser?.email || 'engineer@company.com',
        speakerRole: currentUser?.role || 'Software Engineer',
        department: currentUser?.department || 'Engineering',
        date,
        time,
        duration,
        level,
        meetingUrl: meetingUrl.trim() || 'https://meet.google.com/new',
        slidesUrl: slidesUrl.trim(),
        attendees: [currentUser?.email].filter(Boolean), // host auto-attends
      };

      await onSubmit(newTalk);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to publish tech talk. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const userInitials = (currentUser?.name || 'ME')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-[#121824] border border-[#1e293b] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header - Fixed */}
        <div className="px-6 py-4 border-b border-[#1e293b] flex items-center justify-between bg-[#141b26] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/25 text-orange-400 flex items-center justify-center shadow-inner">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Propose a Tech Talk or Workshop
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-slate-400">
                Share your architectural insights, brown-bag demos, or new tooling with the team.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="propose-talk-form" onSubmit={handleSubmit} className="px-6 py-5 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Speaker Info Banner */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                {userInitials}
              </div>
              <div>
                <p className="font-semibold text-slate-200">
                  {currentUser?.name || 'Current Colleague'} <span className="text-slate-400 font-normal">({currentUser?.email})</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  {currentUser?.role || 'Software Engineer'} • <span className="text-slate-300">{currentUser?.department || 'Engineering'}</span>
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
              Speaker / Host
            </span>
          </div>

          {/* Talk Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Talk Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Enterprise Machine Learning: From Notebooks to Production APIs"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-500 text-sm transition-all"
            />
          </div>

          {/* Target Audience & Difficulty Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Target Audience & Difficulty Level <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {levels.map((lvl) => {
                const isSelected = level === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setLevel(lvl.id)}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? `${lvl.color} shadow-sm ring-1 ring-indigo-500/40`
                        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{lvl.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug">{lvl.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Abstract / Agenda */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-200">
                Abstract & Key Takeaways <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] text-slate-500">{abstract.length}/500</span>
            </div>
            <textarea
              required
              rows={3}
              maxLength={500}
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              placeholder="What will attendees learn? Share 2-3 sentences outlining key takeaways, architecture diagrams, live demos, or code examples..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-500 text-xs transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Format / Duration — Beautiful Clickable Option Cards */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Session Format & Duration <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {durationFormats.map((fmt) => {
                const Icon = fmt.icon;
                const isSelected = duration === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setDuration(fmt.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 text-white ring-1 ring-indigo-500/40 shadow-sm'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-indigo-400" />
                        {fmt.label}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium leading-tight">
                      {fmt.sublabel}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Proposed Date & Time Slot Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-orange-400" />
                Proposed Date <span className="text-rose-400">*</span>
              </label>
              <CustomDatePicker
                value={date}
                onChange={setDate}
                minDate={todayStr}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Time Slot
              </label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="04:00 PM - 04:45 PM"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 text-slate-200 text-xs transition-all"
              />
            </div>
          </div>

          {/* Meeting URL & Slides URL Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-emerald-400" />
                Meeting Room URL
              </label>
              <input
                type="url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 text-slate-200 text-xs transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Slides / Agenda Link <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="url"
                value={slidesUrl}
                onChange={(e) => setSlidesUrl(e.target.value)}
                placeholder="https://slides.company.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 text-slate-200 text-xs transition-all"
              />
            </div>
          </div>
        </form>

        {/* Footer - Fixed */}
        <div className="px-6 py-4 border-t border-[#1e293b] bg-[#141b26] flex items-center justify-between gap-3 flex-shrink-0">
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Publishing makes your talk immediately visible to the whole company for RSVPs.
          </p>
          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="propose-talk-form"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-600 hover:from-orange-600 hover:to-indigo-700 shadow-lg shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isSubmitting ? 'Publishing Talk...' : 'Publish Tech Talk'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
