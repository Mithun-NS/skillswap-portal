import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Info,
  ExternalLink,
  X
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function formatRelativeTime(dateString) {
  if (!dateString) return 'recently';
  const now = new Date();
  const date = new Date(dateString);
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getIconForType(type) {
  switch (type) {
    case 'booking_new':
      return { icon: Calendar, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    case 'booking_cancelled':
      return { icon: AlertTriangle, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
    case 'booking_completed':
      return { icon: CheckCircle2, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' };
    case 'talk_rsvp':
      return { icon: Sparkles, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    case 'talk_reminder':
      return { icon: Bell, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
    default:
      return { icon: Info, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' };
  }
}

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const menuRef = useRef(null);

  const userEmail = user?.email || '';

  const fetchNotifications = async () => {
    if (!userEmail) return;
    try {
      const data = await api.getNotifications(userEmail);
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (err) {
      console.warn('[NotificationBell] Error fetching notifications:', err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Auto-poll notifications every 8 seconds for real-time live feeling
    const interval = setInterval(fetchNotifications, 8000);

    const handleStorageChange = () => fetchNotifications();
    window.addEventListener('skillswap:storage_change', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('skillswap:storage_change', handleStorageChange);
    };
  }, [userEmail]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id || n._id === id ? { ...n, read: true } : n))
    );
    try {
      await api.markNotificationAsRead(id);
    } catch (_) {}
  };

  const handleMarkAllRead = async () => {
    if (!userEmail) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await api.markAllNotificationsAsRead(userEmail);
    } catch (_) {}
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id && n._id !== id));
    try {
      await api.deleteNotification(id);
    } catch (_) {}
  };

  const handleItemClick = async (notif) => {
    if (!notif.read) {
      await handleMarkAsRead(notif.id || notif._id);
    }
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const filteredList = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  return (
    <div className="relative" ref={menuRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        aria-label="View notifications"
        className={`relative p-2 rounded-xl text-slate-300 hover:text-white border transition-all duration-200 ${
          isOpen
            ? 'bg-[#1e293b] border-[#f97316]/40 text-white shadow-lg shadow-[#f97316]/10'
            : 'bg-[#141b26] hover:bg-[#1a2332] border-[#1e293b]'
        }`}
      >
        <Bell className={`w-4 h-4 transition-transform ${unreadCount > 0 ? 'text-[#f97316]' : 'text-slate-400'}`} />
        
        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-gradient-to-r from-[#f97316] to-amber-500 text-[10px] font-bold text-white shadow-md shadow-[#f97316]/40 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl bg-[#0f172a]/95 border border-[#1e293b] shadow-2xl backdrop-blur-xl z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e293b] bg-[#141b26]/70">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/30">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-[#f97316] transition-colors px-2 py-1 rounded-md hover:bg-slate-800"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1e293b]/60 bg-[#0b0f17]/40 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filter === 'all'
                  ? 'bg-[#1e293b] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filter === 'unread'
                  ? 'bg-[#1e293b] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-[#1e293b]/40">
            {filteredList.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-10 h-10 rounded-full bg-[#1e293b]/50 border border-slate-700/50 flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-5 h-5 text-slate-500" />
                </div>
                <p className="text-xs font-medium text-slate-300">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-[220px] mx-auto">
                  Updates on booked sessions, RSVPs, and tech talks will appear here.
                </p>
              </div>
            ) : (
              filteredList.map((notif) => {
                const id = notif.id || notif._id;
                const { icon: IconComp, color: colorClasses } = getIconForType(notif.type);
                return (
                  <div
                    key={id}
                    onClick={() => handleItemClick(notif)}
                    className={`group relative flex items-start gap-3 p-3.5 cursor-pointer transition-all ${
                      !notif.read
                        ? 'bg-slate-800/25 hover:bg-slate-800/40'
                        : 'hover:bg-slate-800/20 opacity-80 hover:opacity-100'
                    }`}
                  >
                    {/* Unread indicator bar */}
                    {!notif.read && (
                      <span className="absolute left-1 top-4 w-1 h-6 rounded-r bg-[#f97316]" />
                    )}

                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${colorClasses}`}>
                      <IconComp className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h4 className={`text-xs font-semibold truncate ${!notif.read ? 'text-white' : 'text-slate-300'}`}>
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>

                      {notif.link && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#f97316] font-medium mt-1.5 group-hover:underline">
                          View details
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>

                    {/* Quick actions (Dismiss) */}
                    <button
                      onClick={(e) => handleDelete(id, e)}
                      title="Dismiss notification"
                      className="absolute right-2.5 top-3 p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 bg-[#0b0f17]/60 border-t border-[#1e293b]/60 flex items-center justify-between text-[11px] text-slate-500">
              <span>Auto-refreshes in real-time</span>
              <button
                onClick={fetchNotifications}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
