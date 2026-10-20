import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Handshake, 
  Trash2, 
  Pencil,
  ChevronDown, 
  ChevronUp,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import RequestSkillModal from './RequestSkillModal';

function formatRelativeTime(dateString) {
  if (!dateString) return 'recently';
  const now = new Date();
  const date = new Date(dateString);
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function SkillWishlistSection({ onSelectMentorToBook }) {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWish, setEditingWish] = useState(null);
  const [activeTab, setActiveTab] = useState('open'); // 'open' | 'matched' | 'all'
  const [isExpanded, setIsExpanded] = useState(true);

  const fetchWishlist = async () => {
    try {
      const data = await api.getWishlist();
      if (Array.isArray(data)) {
        setWishlist(data);
      }
    } catch (err) {
      console.warn('[Wishlist] Failed to fetch:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleModalSubmit = async (formData) => {
    if (formData.id) {
      // Editing existing wish
      try {
        const updated = await api.updateWishlistItem(formData.id, {
          skill: formData.skill,
          description: formData.description,
        });
        setWishlist((prev) =>
          prev.map((w) => (w.id === formData.id || w._id === formData.id ? { ...w, ...updated } : w))
        );
        toast.success(`Skill request updated! ✏️`);
        window.dispatchEvent(new Event('skillswap:storage_change'));
      } catch (err) {
        toast.error(err.message || 'Failed to update request');
      }
    } else {
      // Creating new wish
      try {
        const newWish = await api.addWishlistItem(formData);
        setWishlist((prev) => [newWish, ...prev]);
        toast.success(`Skill request for "${formData.skill}" posted! 🎯`);
        window.dispatchEvent(new Event('skillswap:storage_change'));
      } catch (err) {
        toast.error(err.message || 'Failed to post request');
      }
    }
    setEditingWish(null);
  };

  const handleVolunteer = async (wish) => {
    if (!currentUser?.email) {
      toast.error('Please log in to volunteer');
      return;
    }
    const id = wish.id || wish._id;
    const isRequester = wish.requesterEmail?.toLowerCase() === currentUser.email.toLowerCase();
    if (isRequester) {
      toast.error('You cannot volunteer for your own request!');
      return;
    }

    try {
      const result = await api.volunteerWishlist(id, currentUser.name, currentUser.email);
      setWishlist((prev) =>
        prev.map((w) =>
          w.id === id || w._id === id
            ? {
                ...w,
                status: 'matched',
                matchedMentorName: currentUser.name,
                matchedMentorEmail: currentUser.email,
                matchedAt: new Date().toISOString(),
              }
            : w
        )
      );
      toast.success(`Awesome! You volunteered to teach ${wish.skill}. Notification sent to ${wish.requesterName} 🎉`);
      window.dispatchEvent(new Event('skillswap:storage_change'));
    } catch (err) {
      toast.error(err.message || 'Failed to volunteer');
    }
  };

  const handleDelete = async (wish) => {
    const id = wish.id || wish._id;
    try {
      await api.deleteWishlistItem(id);
      setWishlist((prev) => prev.filter((w) => w.id !== id && w._id !== id));
      toast.info('Skill request removed');
    } catch (err) {
      toast.error(err.message || 'Failed to remove');
    }
  };

  const openCount = wishlist.filter((w) => w.status !== 'matched').length;
  const matchedCount = wishlist.filter((w) => w.status === 'matched').length;

  const filteredList = wishlist.filter((w) => {
    if (activeTab === 'open') return w.status !== 'matched';
    if (activeTab === 'matched') return w.status === 'matched';
    return true;
  });

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#141b26] to-[#0f172a] border border-[#1e293b] overflow-hidden shadow-xl">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 border-b border-[#1e293b]/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Skill Wishlist & Requests
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-[#f97316] border border-orange-500/30">
                {openCount} Open Needs
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Can't find a mentor for a technology? Request it here or volunteer to teach a colleague.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setEditingWish(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs bg-[#f97316] hover:bg-orange-500 text-white shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Request a Skill</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse wishlist' : 'Expand wishlist'}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-[#0e141d] border border-[#1e293b] hover:bg-[#1a2332] transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Content Area */}
      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-4">
          {/* Tab Filter */}
          <div className="flex items-center gap-2 border-b border-[#1e293b]/60 pb-3 text-xs">
            <button
              onClick={() => setActiveTab('open')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'open'
                  ? 'bg-[#1e293b] text-white shadow-sm border border-slate-700/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Open Requests ({openCount})
            </button>
            <button
              onClick={() => setActiveTab('matched')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'matched'
                  ? 'bg-[#1e293b] text-white shadow-sm border border-slate-700/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Matched & Paired ({matchedCount})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-[#1e293b] text-white shadow-sm border border-slate-700/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({wishlist.length})
            </button>
          </div>

          {/* Grid of Wishlist Cards */}
          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading wishlist requests...</div>
          ) : filteredList.length === 0 ? (
            <div className="py-10 text-center rounded-xl bg-[#0e141d]/50 border border-[#1e293b]/50 p-6">
              <Sparkles className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold text-slate-300">
                {activeTab === 'open' ? 'No open skill requests right now' : 'No requests in this view'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                Need to learn a new framework, tool, or design pattern? Click "Request a Skill" to ask the engineering team.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredList.map((wish) => {
                const id = wish.id || wish._id;
                const isMatched = wish.status === 'matched';
                const isOwner = wish.requesterEmail?.toLowerCase() === currentUser?.email?.toLowerCase();

                return (
                  <div
                    key={id}
                    className={`relative flex flex-col justify-between p-4 rounded-xl border transition-all ${
                      isMatched
                        ? 'bg-[#0d1620]/60 border-emerald-500/20'
                        : 'bg-[#0e141d] border-[#1e293b] hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Top Bar: Skill tag + Status */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-[#f97316]/15 text-[#f97316] border border-[#f97316]/30">
                          {wish.skill}
                        </span>

                        {isMatched ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Matched</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatRelativeTime(wish.createdAt)}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {wish.description && (
                        <p className="text-xs text-slate-300 leading-relaxed mb-3 line-clamp-2">
                          "{wish.description}"
                        </p>
                      )}

                      {/* Requester Info */}
                      <div className="text-xs text-slate-400 mb-3">
                        Requested by <span className="text-slate-200 font-semibold">{wish.requesterName}</span>
                      </div>
                    </div>

                    {/* Matched State Info */}
                    {isMatched && (
                      <div className="mb-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                        <Handshake className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div className="truncate">
                          <span>Mentor: </span>
                          <span className="font-semibold text-white">{wish.matchedMentorName}</span>
                        </div>
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="pt-2 border-t border-[#1e293b]/60 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-500">
                        {!isMatched ? 'Open for pairing' : 'Paired with mentor'}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Volunteer Button (if open and not requester) */}
                        {!isMatched && !isOwner && (
                          <button
                            onClick={() => handleVolunteer(wish)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all hover:scale-[1.02]"
                          >
                            <Handshake className="w-3.5 h-3.5" />
                            <span>I can teach this!</span>
                          </button>
                        )}

                        {/* Owner Actions: Edit & Delete */}
                        {isOwner && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingWish(wish);
                                setIsModalOpen(true);
                              }}
                              title="Edit request"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(wish)}
                              title="Delete request"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <RequestSkillModal
        isOpen={isModalOpen}
        initialData={editingWish}
        onClose={() => {
          setIsModalOpen(false);
          setEditingWish(null);
        }}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}
