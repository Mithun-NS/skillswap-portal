import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Users, 
  CalendarCheck, 
  Sparkles, 
  Handshake, 
  Menu, 
  X, 
  FileJson,
  UserCheck
} from 'lucide-react';
import { storage } from '../../utils/storage';
import TeamDataModal from './TeamDataModal';

export default function Navbar() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(storage.getCurrentUser());
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync state when storage changes
  useEffect(() => {
    const updateStats = () => {
      const user = storage.getCurrentUser();
      setCurrentUser(user);

      const bookings = storage.getBookings();
      const active = bookings.filter(
        (b) => (b.menteeId === user.id || b.mentorId === user.id) && b.status === 'confirmed'
      );
      setUpcomingCount(active.length);
    };

    updateStats();
    window.addEventListener('skillswap:storage_change', updateStats);
    return () => window.removeEventListener('skillswap:storage_change', updateStats);
  }, []);

  const navItems = [
    {
      to: '/',
      label: 'Mentor Hub',
      icon: Users,
      badge: null,
    },
    {
      to: '/bookings',
      label: 'My Bookings',
      icon: CalendarCheck,
      badge: upcomingCount > 0 ? upcomingCount : null,
    },
    {
      to: '/talks',
      label: 'Tech Talks',
      icon: Sparkles,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
  ];

  const getInitials = (name) => {
    if (!name) return 'ME';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#1e293b] bg-[#0b0f17]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Left: Brand & Soft Rounded Badge */}
            <div className="flex items-center gap-3">
              <NavLink to="/" className="flex items-center gap-2.5 group">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#f97316]/15 text-[#f97316] border border-[#f97316]/30 group-hover:bg-[#f97316]/20 transition-colors">
                  <Handshake className="w-5 h-5 text-[#f97316]" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base tracking-tight text-white group-hover:text-slate-200 transition-colors">
                      Skill<span className="text-[#f97316]">Swap</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Internal Beta
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-normal hidden sm:block">
                    Peer Mentorship & Knowledge Exchange
                  </span>
                </div>
              </NavLink>
            </div>

            {/* Middle: Clean Segmented Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-[#141b26] border border-[#1e293b]">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-[#1e293b] text-white shadow-sm border border-slate-700/50'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a2332]/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#f97316]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full border ${
                          item.badgeColor || 'bg-orange-500/15 text-orange-400 border-orange-500/20'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* Right: Team Sync & User Profile Chip */}
            <div className="flex items-center gap-2.5">
              {/* Team Data Backup Button */}
              <button
                onClick={() => setIsBackupModalOpen(true)}
                title="Team Data Sync / Export JSON"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#141b26] hover:bg-[#1a2332] text-slate-300 hover:text-white border border-[#1e293b] transition-colors"
              >
                <FileJson className="w-3.5 h-3.5 text-slate-400" />
                <span>Team Sync</span>
              </button>

              {/* User Profile Chip: Dual-tone circular avatar, full name, and designation */}
              <NavLink
                to="/my-profile"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full border transition-all duration-150 ${
                    isActive
                      ? 'bg-[#1e293b] border-orange-500/40 text-white'
                      : 'bg-[#141b26] hover:bg-[#1a2332] border-[#1e293b] text-slate-300'
                  }`
                }
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-[11px] font-bold text-white shadow-sm shrink-0">
                  {getInitials(currentUser?.name)}
                </div>
                <div className="hidden lg:flex flex-col text-left leading-none">
                  <span className="text-xs font-semibold text-slate-200">
                    {currentUser?.name || 'My Profile'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    {currentUser?.role || 'Staff Engineer'}
                  </span>
                </div>
              </NavLink>

              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#141b26] transition-colors"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#1e293b] bg-[#0d131f] px-4 pt-3 pb-5 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#1e293b] text-white border border-slate-700/60'
                      : 'text-slate-300 hover:bg-[#141b26]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-[#f97316]" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        item.badgeColor || 'bg-orange-500/15 text-orange-400 border-orange-500/20'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}

            <div className="pt-2 border-t border-[#1e293b] flex gap-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsBackupModalOpen(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-medium bg-[#141b26] border border-[#1e293b] text-slate-200"
              >
                <FileJson className="w-4 h-4 text-slate-400" />
                Team Sync
              </button>
              <NavLink
                to="/my-profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-semibold bg-[#f97316] text-white"
              >
                <UserCheck className="w-4 h-4" />
                My Profile
              </NavLink>
            </div>
          </div>
        )}
      </header>

      {/* Team Data Modal */}
      <TeamDataModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />
    </>
  );
}
