import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomDropdown({
  value,
  onChange,
  options = [],
  placeholder = 'Select option',
  icon: Icon,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Find selected option object or string
  const currentOption = options.find((opt) => {
    if (typeof opt === 'string') return opt === value;
    return opt.value === value;
  });

  const displayLabel = typeof currentOption === 'string'
    ? currentOption
    : currentOption?.label || placeholder;

  const currentDotColor = typeof currentOption === 'object' ? currentOption.dotColor : null;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-indigo-500/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-left text-xs font-medium text-slate-200 hover:text-white flex items-center justify-between transition-all shadow-sm group"
      >
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors flex-shrink-0" />}
          {currentDotColor && (
            <span className={`w-2 h-2 rounded-full ${currentDotColor} flex-shrink-0`} />
          )}
          <span className="truncate">{displayLabel}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform duration-200 flex-shrink-0 ml-2 ${
            isOpen ? 'rotate-180 text-indigo-400' : ''
          }`}
        />
      </button>

      {/* Floating Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-full min-w-[200px] bg-[#141b26] border border-[#2d3748] rounded-xl shadow-2xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto">
          {options.map((opt, i) => {
            const optValue = typeof opt === 'string' ? opt : opt.value;
            const optLabel = typeof opt === 'string' ? opt : opt.label;
            const dotColor = typeof opt === 'object' ? opt.dotColor : null;
            const isSelected = optValue === value;

            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onChange(optValue);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between text-left transition-all ${
                  isSelected
                    ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {dotColor && <span className={`w-2 h-2 rounded-full ${dotColor} flex-shrink-0`} />}
                  <span className="truncate">{optLabel}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
