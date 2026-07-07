import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSelector = ({ variant = 'inline' }) => {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
  ];

  if (variant === 'pills') {
    return (
      <div className="flex gap-2 justify-center items-center">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`px-4 py-2 rounded-xl text-base font-medium transition-all ${
              language === lang.code
                ? 'bg-saffron text-white shadow-md font-semibold'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
            aria-label={`Switch to ${lang.name}`}
          >
            {lang.native}
          </button>
        ))}
      </div>
    );
  }

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      className="bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
      aria-label="Language Selector"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.native} ({lang.name})
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector;
