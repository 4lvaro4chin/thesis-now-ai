'use client';

import { useState, useEffect } from 'react';
import { translations, detectLanguage, type Language } from './i18n';

export function useTranslation(lang?: Language) {
  const [currentLang, setCurrentLang] = useState<Language>(lang || 'es');

  useEffect(() => {
    setCurrentLang(lang || detectLanguage());

    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ lang: Language }>;
      setCurrentLang(customEvent.detail.lang);
    };

    const handleStorageChange = () => {
      const saved = localStorage.getItem('preferredLanguage');
      if (saved === 'es' || saved === 'en' || saved === 'pt') {
        setCurrentLang(saved as Language);
      }
    };

    window.addEventListener('languageChange', handleLanguageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('languageChange', handleLanguageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [lang]);

  return {
    t: (key: string) => {
      return (translations[currentLang] as Record<string, string>)[key] || key;
    },
    lang: currentLang,
  };
}
