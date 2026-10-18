import React from 'react';
import { 
  Users2, 
  ArrowRight, 
  Calendar, 
  Clock, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  ArrowLeftRight,
  Handshake,
  Terminal,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DirectoryPage() {
  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      {/* 1. Hero Banner: Deep Matte Slate with Organic Network Nodes Watermark */}
      <div className="relative overflow-hidden rounded-2xl bg-[#141b26] border border-[#1e293b] p-8 sm:p-12 shadow-xl">
        {/* Subtle Organic Network Watermark (Connected People/Nodes) */}
        <svg 
          className="absolute right-0 top-0 h-full w-2/3 max-w-lg pointer-events-none opacity-[0.06] sm:opacity-[0.08]" 
          viewBox="0 0 500 400" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M 50 80 Q 200 40 350 120 T 460 220" stroke="currentColor" strokeWidth="2" strokeDasharray="4 6" className="text-slate-300" />
          <path d="M 80 320 Q 220 280 320 180 T 480 90" stroke="currentColor" strokeWidth="2" strokeDasharray="4 6" className="text-slate-300" />
          <path d="M 120 180 C 240 160 280 300 420 310" stroke="currentColor" strokeWidth="2" className="text-slate-300" />
          <circle cx="50" cy="80" r="14" className="fill-slate-600/40 stroke-slate-400" strokeWidth="2" />
          <circle cx="350" cy="120" r="18" className="fill-orange-600/30 stroke-orange-400" strokeWidth="2" />
          <circle cx="460" cy="220" r="12" className="fill-slate-600/40 stroke-slate-400" strokeWidth="2" />
          <circle cx="120" cy="180" r="16" className="fill-emerald-600/30 stroke-emerald-400" strokeWidth="2" />
          <circle cx="320" cy="180" r="22" className="fill-orange-600/30 stroke-orange-400" strokeWidth="2" />
          <circle cx="420" cy="310" r="14" className="fill-slate-600/40 stroke-slate-400" strokeWidth="2" />
        </svg>

        <div className="relative z-10 max-w-2xl">
          {/* Badge: INTERNAL SKILL EXCHANGE */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>INTERNAL SKILL EXCHANGE</span>
          </div>

          {/* Large Confident Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
            Find an internal mentor. Pair on hard problems.{' '}
            <span className="text-[#f97316] font-extrabold">Level up together.</span>
          </h1>

          {/* Description */}
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            Search colleagues across Frontend, Backend, QA, Cloud, and SRE. Book real 30-minute 1:1 pairing sessions synced directly into your Google / Outlook work calendar.
          </p>

          {/* Actions */}
          <div className="mt-7 flex flex-wrap items-center gap-3.5">
            <Link
              to="/my-profile"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-[#f97316] hover:bg-[#ea580c] text-white shadow-sm transition-all hover:translate-y-[-1px]"
            >
              Configure My Profile & Slots
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/talks"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-[#1a2332] hover:bg-[#202b3d] text-slate-200 border border-slate-700/80 shadow-sm transition-all hover:translate-y-[-1px]"
            >
              Explore Tech Talks
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Lower Section: Peer Pairing Preview & Hub Initializing State */}
      <div className="rounded-2xl bg-[#141b26] border border-[#1e293b] p-6 sm:p-8 space-y-8">
        {/* Header summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Users2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Peer Pairing Flow Preview</h2>
              <p className="text-xs text-slate-400">How 1:1 peer mentorship and knowledge matching works</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0e141d] border border-[#1e293b] text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Direct Calendar Integration Ready</span>
          </div>
        </div>

        {/* Collaborative Card Preview: Alex <---> Rahul Pairing Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
          {/* Colleague Card 1: Alex */}
          <div className="lg:col-span-5 rounded-xl bg-[#0e141d] border border-[#1e293b] p-5 space-y-4 hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#1e293b]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                  AM
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Alex Morgan</h3>
                  <p className="text-xs text-slate-400">Full Stack Engineer • Cloud Platform</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                <Clock className="w-3 h-3" />
                Thu 4:00 PM
              </span>
            </div>

            {/* 2-Column Balanced Skill Matrix: Eliminates empty blank space */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-orange-400 uppercase tracking-wider block">
                  Can Mentor In
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['React.js', 'Node.js', 'Docker', 'GraphQL'].map((skill) => (
                    <span 
                      key={skill}
                      className="px-2.5 py-1 rounded-md bg-[#1a2332] text-slate-200 border border-[#26354a] text-[11px] font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Currently Learning
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['Kubernetes', 'Rust', 'System Design'].map((skill) => (
                    <span 
                      key={skill}
                      className="px-2.5 py-1 rounded-md bg-[#131924] text-slate-400 border border-[#1b2535] text-[11px]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Card footer details */}
            <div className="pt-2 flex items-center justify-between text-xs border-t border-[#1e293b]/80">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                Code Review & Frontend Architecture
              </span>
              <span className="text-[11px] text-slate-300 font-medium bg-[#16202e] px-2.5 py-0.5 rounded-md border border-[#223044]">
                30m Slot
              </span>
            </div>
          </div>

          {/* Center Connector: Organic Pairing Flow */}
          <div className="lg:col-span-1 flex flex-col items-center justify-center py-2 lg:py-0">
            <div className="flex lg:flex-col items-center gap-1.5 px-3 py-2 rounded-xl bg-[#141d2b] border border-[#223044] text-orange-400 shadow-sm text-center">
              <ArrowLeftRight className="w-4 h-4 text-orange-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                1:1 Pairing
              </span>
            </div>
          </div>

          {/* Colleague Card 2: Rahul */}
          <div className="lg:col-span-5 rounded-xl bg-[#0e141d] border border-[#1e293b] p-5 space-y-4 hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#1e293b]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                  RM
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Rahul Mehta</h3>
                  <p className="text-xs text-slate-400">Senior Backend Engineer • Payments</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                <Clock className="w-3 h-3" />
                Wed 2:00 PM
              </span>
            </div>

            {/* 2-Column Balanced Skill Matrix: Eliminates empty blank space */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-orange-400 uppercase tracking-wider block">
                  Can Mentor In
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['Distributed Systems', 'Go', 'Redis', 'PostgreSQL'].map((skill) => (
                    <span 
                      key={skill}
                      className="px-2.5 py-1 rounded-md bg-[#1a2332] text-slate-200 border border-[#26354a] text-[11px] font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Currently Learning
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['React 19', 'Next.js', 'Tailwind CSS'].map((skill) => (
                    <span 
                      key={skill}
                      className="px-2.5 py-1 rounded-md bg-[#131924] text-slate-400 border border-[#1b2535] text-[11px]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Card footer details */}
            <div className="pt-2 flex items-center justify-between text-xs border-t border-[#1e293b]/80">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                API Scalability & Database Pairing
              </span>
              <span className="text-[11px] text-slate-300 font-medium bg-[#16202e] px-2.5 py-0.5 rounded-md border border-[#223044]">
                30m Slot
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Explanatory Banner: Warm Collaborative State */}
        <div className="p-4 rounded-xl bg-[#0e141d]/80 border border-[#1e293b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/20">
              <Handshake className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Mentor & Skill Hub Initializing</h4>
              <p className="text-xs text-slate-400">
                Multi-select tech stack matching, two-way skill tagging, and instant calendar booking are being implemented in Feature Branch 03.
              </p>
            </div>
          </div>

          <Link
            to="/my-profile"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#1a2332] hover:bg-[#202b3d] text-slate-200 border border-[#26354a] transition-colors shrink-0"
          >
            Setup your own skills
            <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
