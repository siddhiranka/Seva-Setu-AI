import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useSpeech } from '../hooks/useSpeech';
import FeatureCard from '../components/FeatureCard';
import { motion } from 'framer-motion';
import {
  FiMic,
  FiFileText,
  FiAlertCircle,
  FiAward,
  FiBookOpen,
  FiEye,
  FiArrowRight,
  FiSearch,
  FiCpu,
  FiShield,
  FiGlobe
} from 'react-icons/fi';

const Landing = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isListening, startListening, stopListening } = useSpeech();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');

  const features = [
    {
      icon: <FiMic />,
      title: t.voiceFirst,
      description: t.voiceFirstDesc,
    },
    {
      icon: <FiFileText />,
      title: t.docChecklist,
      description: t.docChecklistDesc,
    },
    {
      icon: <FiAlertCircle />,
      title: t.complaints,
      description: t.complaintsDesc,
    },
    {
      icon: <FiAward />,
      title: t.schemes,
      description: t.schemesDesc,
    },
    {
      icon: <FiBookOpen />,
      title: t.simpleLang,
      description: t.simpleLangDesc,
    },
    {
      icon: <FiEye />,
      title: t.accessible,
      description: t.accessibleDesc,
    },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    const dest = user ? '/chat' : '/login?redirect=chat';
    navigate(`${dest}${dest.includes('?') ? '&' : '?'}query=${encodeURIComponent(searchVal)}`);
  };

  const handleChipClick = (queryText) => {
    const dest = user ? '/chat' : '/login?redirect=chat';
    navigate(`${dest}${dest.includes('?') ? '&' : '?'}query=${encodeURIComponent(queryText)}`);
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((transcript) => {
        setSearchVal(transcript); // just paste into box, user clicks arrow to send
      });
    }
  };

  const chips = [
    { label: 'Passport', query: 'How to apply for an Indian Passport?' },
    { label: 'Aadhaar Card', query: 'What documents are required for Aadhaar updates?' },
    { label: 'PAN Card', query: 'How do I apply for a new PAN card?' },
    { label: 'Scholarships', query: 'What government scholarships are available for students?' },
    { label: 'Pension Schemes', query: 'What pension schemes apply to senior citizens?' },
  ];

  const displayChips = t.chips || chips;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-20 pb-16 max-w-6xl mx-auto"
    >
      
      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-between gap-10 pt-4 lg:pt-8 pb-4 relative z-10">
        
        {/* Left Column: AI Interface */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 text-left space-y-8 max-w-xl"
        >
          <span className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full text-xs font-bold bg-sky-50 text-sky-600 tracking-wide border border-sky-100/50">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse"></span>
            🇮🇳 {t.langSupport}
          </span>

          <div className="space-y-4">
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight text-slate-800">
              {t.heroTitleStart || "Your Personal"} <br />
              <span className="bg-gradient-to-r from-accent to-amber-600 bg-clip-text text-transparent">
                {t.heroTitleEnd || "AI Government Assistant"}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-650 leading-relaxed font-semibold">
              {t.heroDescription || "Helping every Indian citizen access government services, discover schemes, file complaints, and understand official documents in their own language."}
            </p>
          </div>

          {/* Trust Badges Moved Up for Visibility */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-sky-50 border border-sky-100 text-[11px] sm:text-[13px] font-extrabold text-slate-700 shadow-sm">
              <FiMic className="text-sky-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{t.trustVoice || "Voice First"}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-orange-50 border border-orange-100 text-[11px] sm:text-[13px] font-extrabold text-slate-700 shadow-sm">
              <FiGlobe className="text-accent w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{t.trustLang || "Multilingual"}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] sm:text-[13px] font-extrabold text-slate-700 shadow-sm">
              <FiShield className="text-emerald-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{t.trustSecure || "Secure"}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[11px] sm:text-[13px] font-extrabold text-slate-700 shadow-sm">
              <FiCpu className="text-indigo-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{t.trustAI || "AI Powered"}</span>
            </div>
          </div>

          {/* Large Rounded Search Bar (Gemini-style) */}
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-lg bg-white rounded-3xl border-2 border-sky-150 focus-within:border-accent p-2 shadow-lg shadow-sky-100/30 flex items-center transition-all duration-300">
            <span className="pl-3 text-slate-400">
              <FiSearch className="w-5 h-5" />
            </span>
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder={t.askQuestion}
              className="w-full pl-3 pr-20 py-3 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none text-base font-bold"
            />
            <div className="absolute right-2 flex items-center gap-1">
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/25 animate-pulse scale-110'
                    : 'text-slate-400 hover:text-accent hover:bg-sky-50'
                }`}
                title="Speak to AI"
              >
                <FiMic className="w-5 h-5" />
              </button>
              <button
                type="submit"
                className="w-10 h-10 rounded-full bg-accent hover:bg-amber-600 text-white flex items-center justify-center shadow-md shadow-accent/20 transition-all active:scale-95 cursor-pointer"
              >
                <FiArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Suggestion Chips */}
          <div className="flex flex-wrap gap-2 pt-2">
            {displayChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(chip.query)}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-655 bg-sky-50 border border-sky-100 rounded-full hover:bg-sky-100 hover:text-sky-700 hover:border-sky-200 transition-all cursor-pointer shadow-sm"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Right Column: Cartoon Illustration of Indian Family */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 flex justify-center items-center relative w-full overflow-hidden sm:overflow-visible"
        >
          {/* Animated rings behind illustration */}
          <div className="absolute inset-0 flex justify-center items-center -z-10">
            <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full border-2 border-dashed border-primary/10 animate-spin-slow"></div>
            <div className="w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-primary-light/30 animate-pulse absolute"></div>
          </div>

          {/* Using User's Preferred Image */}
          <img 
            src="/media1.png" 
            alt="AI Assistant Team" 
            className="w-full max-w-2xl h-auto mix-blend-multiply scale-90 sm:scale-100 lg:scale-110 transform origin-center lg:translate-x-12 drop-shadow-sm mt-4 sm:mt-0" 
          />
        </motion.div>
      </section>

      {/* Feature highlight grids */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <h2 className="font-display font-extrabold text-3xl text-slate-800">
            {t.featuresTitle}
          </h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {t.featuresSub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <FeatureCard
              key={idx}
              icon={feat.icon}
              title={feat.title}
              description={feat.description}
            />
          ))}
        </div>
      </section>

      {/* Steps Section */}
      <section className="premium-card p-8 max-w-5xl mx-auto">
        <h3 className="font-display font-extrabold text-2xl text-center text-slate-800 mb-10">
          {t.howItWorksTitle}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-sky-500 text-white font-extrabold text-sm flex items-center justify-center mx-auto shadow-md shadow-sky-500/20">
              1
            </div>
            <h4 className="font-bold text-sm text-slate-800">{t.howItWorksStep1Title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              {t.howItWorksStep1Desc}
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-accent text-white font-extrabold text-sm flex items-center justify-center mx-auto shadow-md shadow-accent/20">
              2
            </div>
            <h4 className="font-bold text-sm text-slate-800">{t.howItWorksStep2Title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              {t.howItWorksStep2Desc}
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-sky-600 text-white font-extrabold text-sm flex items-center justify-center mx-auto shadow-md shadow-sky-600/20">
              3
            </div>
            <h4 className="font-bold text-sm text-slate-800">{t.howItWorksStep3Title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              {t.howItWorksStep3Desc}
            </p>
          </div>
        </div>
      </section>

    </motion.div>
  );
};

export default Landing;
