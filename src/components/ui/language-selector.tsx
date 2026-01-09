'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
] as const;

type LanguageCode = (typeof LANGUAGES)[number]['code'];

interface LanguageSelectorProps {
  currentLocale?: LanguageCode;
  onChange?: (locale: LanguageCode) => void;
}

export function LanguageSelector({ currentLocale = 'en', onChange }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(currentLocale);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = LANGUAGES.find((lang) => lang.code === selected) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = async (code: LanguageCode) => {
    setSelected(code);
    setIsOpen(false);

    if (onChange) {
      onChange(code);
    } else {
      // Default behavior: call the API to update user's language
      try {
        const response = await fetch('/api/user/language', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locale: code }),
        });

        if (response.ok) {
          // Optionally refresh the page to apply the new language
          window.location.reload();
        }
      } catch (error) {
        console.error('Failed to update language:', error);
        // Revert on error
        setSelected(currentLocale);
      }
    }
  };

  return (
    <div
      className="relative"
      ref={dropdownRef}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate hover:text-navy flex items-center gap-1 text-sm font-medium transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLanguage.flag}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 z-50 mt-2 min-w-[160px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {LANGUAGES.map((language) => (
            <button
              key={language.code}
              type="button"
              onClick={() => handleSelect(language.code)}
              className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                selected === language.code ? 'text-navy bg-gray-50 font-medium' : 'text-slate'
              }`}
              role="option"
              aria-selected={selected === language.code}
            >
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
