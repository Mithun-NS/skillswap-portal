import React from 'react';
import Navbar from './Navbar';
import { Users2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function AppLayout({ children }) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

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

      {/* Footer */}
      {isLoginPage ? (
        <footer className="border-t border-[#1e293b]/40 bg-[#0b0f17] mt-auto py-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SkillSwap • Internal Corporate Mentorship Portal</p>
        </footer>
      ) : (
        <footer className="border-t border-[#1e293b] bg-[#0d131f]/90 mt-auto py-6 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
                <Users2 className="w-3.5 h-3.5" />
              </div>
              <p className="text-slate-400">
                <strong className="text-slate-200">SkillSwap</strong> — Peer mentorship & knowledge exchange.
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

            <div className="text-slate-500 text-[11px]">
              © {new Date().getFullYear()} SkillSwap
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
