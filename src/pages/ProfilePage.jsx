import React from 'react';
import { UserCheck, Sparkles } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="p-8 rounded-2xl bg-[#141b26] border border-[#1e293b] text-center shadow-lg">
        <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
          <UserCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Employee Self-Service Profile</h2>
        <p className="text-sm text-slate-300 mt-2 max-w-lg mx-auto leading-relaxed">
          Configure your corporate email, designate skills you can teach vs. what you want to learn, set available weekly slots, and control your meeting cap.
        </p>
        <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          Scheduled for implementation in branch: feature/02-employee-profile-and-storage
        </div>
      </div>
    </div>
  );
}
