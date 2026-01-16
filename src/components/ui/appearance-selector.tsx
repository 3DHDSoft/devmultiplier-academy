'use client';

import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const APPEARANCES = [
  { value: 'light', name: 'Light', icon: Sun },
  { value: 'dark', name: 'Dark', icon: Moon },
  { value: 'system', name: 'System', icon: Monitor },
] as const;

type AppearanceValue = (typeof APPEARANCES)[number]['value'];

export function AppearanceSelector() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentAppearance = APPEARANCES.find((a) => a.value === theme) || APPEARANCES[0];
  const CurrentIcon = currentAppearance.icon;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value: AppearanceValue) => {
    setTheme(value);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-1 text-sm font-medium text-[#656d76] transition-colors hover:text-[#1f2328] dark:text-[#848d97] dark:hover:text-[#e6edf3]" aria-expanded={isOpen} aria-haspopup="listbox" aria-label="Select appearance">
        <CurrentIcon className="h-4 w-4" />
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 z-50 mt-2 min-w-[140px] rounded-md border border-[#d1d9e0] bg-white py-1 shadow-lg dark:border-[#30363d] dark:bg-[#161b22]">
          {APPEARANCES.map((appearance) => {
            const Icon = appearance.icon;
            return (
              <button
                key={appearance.value}
                type="button"
                onClick={() => handleSelect(appearance.value)}
                className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] ${theme === appearance.value ? 'bg-[#f6f8fa] font-medium text-[#1f2328] dark:bg-[#21262d] dark:text-[#e6edf3]' : 'text-[#656d76] dark:text-[#848d97]'}`}
                role="option"
                aria-selected={theme === appearance.value}
              >
                <Icon className="h-4 w-4" />
                <span>{appearance.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
