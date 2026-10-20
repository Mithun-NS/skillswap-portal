import React, { useState } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { storage } from '../../utils/storage';

export default function RequestSkillModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const { user } = useAuth();
  const toast = useToast();
  const [skill, setSkill] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (initialData) {
      setSkill(initialData.skill || '');
      setDescription(initialData.description || '');
    } else {
      setSkill('');
      setDescription('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isEditing = Boolean(initialData);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!skill.trim()) {
      toast.error('Please enter the skill or topic name');
      return;
    }

    const activeUser = user || storage.getCurrentUser();
    const cleanEmail = (activeUser?.email || '').trim().toLowerCase() || 'colleague@intimetec.com';
    const cleanName = activeUser?.name || 'Engineer';
    const cleanRole = activeUser?.role || 'Software Engineer';

    setIsSubmitting(true);
    try {
      await onSubmit({
        id: initialData?.id || initialData?._id,
        skill: skill.trim(),
        description: description.trim(),
        requesterName: cleanName,
        requesterEmail: cleanEmail,
        requesterRole: cleanRole,
      });
      setSkill('');
      setDescription('');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-2xl bg-[#0f172a] border border-[#1e293b] p-6 shadow-2xl text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? 'Edit Skill Request' : 'Request a Skill or Mentor'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEditing ? 'Update your topic name or learning goals.' : "Can't find a mentor for a technology? Post a request to the team."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Skill or Topic Name <span className="text-orange-400">*</span>
            </label>
            <input
              type="text"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              placeholder="e.g. Apache Kafka, Rust, GraphQL, Kubernetes Helm, eBPF"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141b26] border border-[#1e293b] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Context or What You Want to Learn (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what specific blocker, project, or concept you'd like guidance on..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141b26] border border-[#1e293b] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all resize-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-2.5 text-xs text-blue-300">
            <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              When a colleague volunteers to teach this skill, you will immediately receive an in-app notification so you can schedule a pairing block.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-[#1e293b] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#f97316] hover:bg-orange-500 text-white shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (isEditing ? 'Saving...' : 'Posting...') : (isEditing ? 'Save Changes' : 'Post to Wishlist')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
