'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Language = 'es' | 'en' | 'pt';

interface LanguageSwitcherProps {
  currentLang?: Language;
}

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
];

export function LanguageSwitcher({ currentLang = 'es' }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLanguageChange = (lang: Language) => {
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferredLanguage', lang);
    }
    setOpen(false);
    // Refresh to apply language change
    router.refresh();
  };

  const currentLanguage = languages.find((l) => l.code === currentLang);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          color: '#6B7280',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#F3F4F6';
          e.currentTarget.style.color = '#1F2937';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#6B7280';
        }}
      >
        <span>{currentLanguage?.flag}</span>
        <span>{currentLanguage?.code.toUpperCase()}</span>
        <span style={{ fontSize: '12px' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 1000,
            minWidth: '140px',
            overflow: 'hidden',
          }}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: 'none',
                background: lang.code === currentLang ? '#F3F4F6' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: 500,
                color: '#1F2937',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                if (lang.code !== currentLang) {
                  e.currentTarget.style.background = '#F9FAFB';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = lang.code === currentLang ? '#F3F4F6' : 'white';
              }}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
              {lang.code === currentLang && <span style={{ marginLeft: 'auto', fontSize: '12px' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
