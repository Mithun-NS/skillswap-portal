import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { Users2, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

export default function AppLayout({ children }) {
  const [dbStatus, setDbStatus] = useState({ status: 'connecting', database: 'Connecting...' });

  useEffect(() => {
    api.checkHealth().then((health) => {
      setDbStatus(health);
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f17] text-slate-100 selection:bg-orange-500 selection:text-white font-sans antialiased">
      {/* Top subtle dusk tint - quiet, non-neon human workspace warmth */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-[#141d2b]/60 via-[#0b0f17]/40 to-transparent pointer-events-none -z-10" />

      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Clean Human-Centric Platform Footer */}
      <footer className="border-t border-[#1e293b] bg-[#0d131f]/90 mt-auto py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
              <Users2 className="w-3.5 h-3.5" />
            </div>
            <p className="text-slate-400">
              <strong className="text-slate-200">SkillSwap</strong> — Internal peer mentorship, 1:1 code pairing & technical knowledge exchange.
            </p>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <Link to="/" className="hover:text-slate-200 transition-colors">
              Mentor Directory
            </Link>
            <Link to="/bookings" className="hover:text-slate-200 transition-colors">
              My Sessions
            </Link>
            <Link to="/talks" className="hover:text-slate-200 transition-colors">
              Tech Talks
            </Link>
            <Link to="/my-profile" className="hover:text-slate-200 transition-colors">
              My Profile & Slots
            </Link>
          </div>

          <div className="flex items-center gap-3 text-slate-500">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#141b26] border border-[#1e293b] text-[11px] font-medium text-slate-300">
              <Database className="w-3 h-3 text-orange-400" />
              <span>DB: {dbStatus.database || 'Active'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              API Online
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
