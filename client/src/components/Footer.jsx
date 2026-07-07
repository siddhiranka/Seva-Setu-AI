import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200/50 py-8 relative">
      {/* Tricolor accent line across the footer top */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF9933] via-slate-200 to-[#138808]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="flex justify-center items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-tr from-primary to-emerald-600 text-white font-display font-extrabold text-[10px] shadow-sm">
            🤖
          </span>
          <span className="font-display font-extrabold text-base text-slate-800">
            {t.title}
          </span>
        </div>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-semibold">
          Disclaimer: Seva Setu AI is an artificial intelligence civic assistant. For critical legal transactions, please verify guidelines on official government web portals.
        </p>
        <div className="text-xs text-slate-400 font-bold">
          &copy; {currentYear} {t.title}. Dedicated to citizen inclusion.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
