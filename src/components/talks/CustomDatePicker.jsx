import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { formatDateLabel } from '../../utils/calendar';

export default function CustomDatePicker({ value, onChange, minDate }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse initial date
  const parseDateStr = (str) => {
    if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return new Date();
    }
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const selectedDate = parseDateStr(value);
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth()); // 0-11

  // Keep view aligned when value changes externally
  useEffect(() => {
    const d = parseDateStr(value);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Navigation
  const prevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Generate calendar days matrix
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const minDateObj = minDate ? parseDateStr(minDate) : new Date(new Date().setHours(0,0,0,0));
  minDateObj.setHours(0,0,0,0);

  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);

  // Quick preset helper
  const handleQuickPreset = (daysToAdd) => {
    const target = new Date();
    target.setDate(target.getDate() + daysToAdd);
    const y = target.getFullYear();
    const m = pad(target.getMonth() + 1);
    const d = pad(target.getDate());
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  // Build grid of days
  const calendarCells = [];

  // 1. Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    calendarCells.push({
      day: dayNum,
      isCurrentMonth: false,
      dateStr: null,
      isDisabled: true,
    });
  }

  // 2. Current month days
  for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
    const cellDate = new Date(viewYear, viewMonth, dayNum, 0, 0, 0, 0);
    const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(dayNum)}`;
    const isDisabled = cellDate < minDateObj;
    const isSelected = dateStr === value;
    const isToday =
      cellDate.toDateString() === new Date().toDateString();

    calendarCells.push({
      day: dayNum,
      isCurrentMonth: true,
      dateStr,
      isDisabled,
      isSelected,
      isToday,
    });
  }

  // 3. Next month leading days to fill 35 or 42 grid cells
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: false,
      dateStr: null,
      isDisabled: true,
    });
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-indigo-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 flex items-center justify-between text-left text-xs transition-all shadow-sm group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Calendar className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform flex-shrink-0" />
          <span className="font-semibold text-slate-100 truncate">
            {value ? formatDateLabel(value) : 'Select a presentation date'}
          </span>
        </div>
        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 ml-2 flex-shrink-0">
          Change
        </span>
      </button>

      {/* Custom Dark Theme Calendar Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-[#141b26] border border-[#2d3748] rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Quick Presets Strip */}
          <div className="flex items-center gap-1.5 mb-3 pb-3 border-b border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Quick:
            </span>
            <button
              type="button"
              onClick={() => handleQuickPreset(2)}
              className="px-2 py-1 rounded-md text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
            >
              In 2 Days
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset(5)}
              className="px-2 py-1 rounded-md text-[11px] font-medium bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 transition-colors border border-indigo-500/20"
            >
              This Friday
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset(7)}
              className="px-2 py-1 rounded-md text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
            >
              Next Week
            </button>
          </div>

          {/* Month & Year Navigation Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <h4 className="text-xs font-bold text-white tracking-wide">
              {monthNames[viewMonth]} {viewYear}
            </h4>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day Names Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {daysOfWeek.map((d, i) => (
              <span key={i} className="text-[11px] font-semibold text-slate-300 py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((cell, idx) => {
              if (!cell.isCurrentMonth) {
                return (
                  <div
                    key={idx}
                    className="h-8 flex items-center justify-center text-[11px] text-slate-600 font-normal select-none"
                  >
                    {cell.day}
                  </div>
                );
              }

              if (cell.isDisabled) {
                return (
                  <div
                    key={idx}
                    className="h-8 flex items-center justify-center text-[11px] text-slate-600 cursor-not-allowed select-none line-through opacity-40"
                  >
                    {cell.day}
                  </div>
                );
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onChange(cell.dateStr);
                    setIsOpen(false);
                  }}
                  className={`h-8 w-full rounded-lg text-xs font-medium flex items-center justify-center transition-all ${
                    cell.isSelected
                      ? 'bg-gradient-to-r from-orange-500 to-indigo-600 text-white font-bold shadow-md shadow-orange-500/20 scale-105'
                      : cell.isToday
                      ? 'bg-slate-800 text-amber-400 font-bold border border-amber-500/40 hover:bg-slate-700'
                      : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
