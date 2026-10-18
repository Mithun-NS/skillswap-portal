import React, { useState } from 'react';
import { Download, Upload, RefreshCw, X, FileJson } from 'lucide-react';
import { storage } from '../../utils/storage';
import { useToast } from '../../context/ToastContext';

export default function TeamDataModal({ isOpen, onClose }) {
  const toast = useToast();
  const [importStatus, setImportStatus] = useState('');

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      const jsonString = storage.exportDatabase();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `skillswap-directory-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Directory backup exported! Share this file with colleagues via Slack/Teams.');
    } catch {
      toast.error('Failed to export directory backup.');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const result = storage.importDatabase(content);
        if (result.success) {
          toast.success(`Successfully imported team data (${result.userCount} colleagues loaded)!`);
          setImportStatus(`Loaded ${result.userCount} colleagues successfully.`);
          setTimeout(() => {
            onClose();
          }, 1200);
        } else {
          toast.error(`Import failed: ${result.error || 'Invalid file format'}`);
          setImportStatus('Error: Invalid JSON format.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('Reset local database back to default initial company colleagues and talks?')) {
      storage.resetAll();
      toast.info('Database restored to default initial state.');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070a0f]/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#141b26] border border-[#1e293b] p-6 shadow-xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Team Data Sync & Backup</h3>
              <p className="text-xs text-slate-400">Share or seed team mentor records across instances</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2332] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-[#0e141d] border border-[#1e293b] text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-orange-400">How Team Sync works:</span> Since SkillSwap runs client-side in Phase 1, you can export your team’s configured mentors and drop the <code className="text-orange-300 font-mono">.json</code> file into Slack. Any colleague can import it here in one click.
          </div>

          {/* Export Action */}
          <div className="p-4 rounded-xl bg-[#0e141d]/60 border border-[#1e293b] flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-white">Export Directory Backup</h4>
              <p className="text-xs text-slate-400">Download current mentors, slots, and scheduled talks</p>
            </div>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#f97316] hover:bg-[#ea580c] text-white transition-all shadow-sm shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>
          </div>

          {/* Import Action */}
          <div className="p-4 rounded-xl bg-[#0e141d]/60 border border-[#1e293b] flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-white">Import Team File</h4>
              <p className="text-xs text-slate-400">Load a mentor dataset shared by your teammates</p>
              {importStatus && (
                <p className="text-xs text-emerald-400 mt-1 font-medium">{importStatus}</p>
              )}
            </div>
            <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#1a2332] hover:bg-[#222d3f] text-slate-200 border border-[#2a364a] cursor-pointer transition-all shrink-0">
              <Upload className="w-3.5 h-3.5 text-orange-400" />
              Upload File
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset Action */}
          <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Trouble with corrupted storage?</span>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-rose-400 hover:text-rose-300 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Reset to Defaults
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#1e293b] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-[#1a2332] hover:bg-[#222d3f] rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
