import React, { useState } from 'react';
import { FiBookmark, FiVolume2, FiVolumeX, FiExternalLink, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import useSpeech from '../hooks/useSpeech';
import { useLanguage } from '../context/LanguageContext';

const SchemeCard = ({ scheme, isSaved, onSave, onUnsave }) => {
  const { t } = useLanguage();
  const { speak, stopSpeaking, isSpeaking } = useSpeech();
  const [showSteps, setShowSteps] = useState(false);

  // Extract application portal link out of description
  const linkMatch = scheme.description ? scheme.description.match(/\[(.*?)\]\((.*?)\)/) : null;
  let cleanDesc = scheme.description || '';
  let applyUrl = '';
  let applyText = '';

  if (linkMatch) {
    applyText = linkMatch[1];
    applyUrl = linkMatch[2];
    cleanDesc = scheme.description.replace(/\[.*?\]\(.*?\)/, '').trim();
  }

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const stepsText = scheme.applySteps ? scheme.applySteps.join('. ') : '';
      const textToRead = `${scheme.schemeTitle}. ${cleanDesc}. Benefits: ${scheme.benefits}. Eligibility: ${scheme.eligibility}. Steps: ${stepsText}`;
      speak(textToRead);
    }
  };

  const stepsList = Array.isArray(scheme.applySteps)
    ? scheme.applySteps
    : scheme.applySteps
    ? [scheme.applySteps]
    : [];

  const getSchemeIcon = (title) => {
    const lower = title.toLowerCase();
    if (lower.includes('kisan') || lower.includes('farm') || lower.includes('agriculture')) return '🌾';
    if (lower.includes('awas') || lower.includes('housing') || lower.includes('home') || lower.includes('poor')) return '🏠';
    if (lower.includes('pension') || lower.includes('atal') || lower.includes('retirement') || lower.includes('elder')) return '👴';
    if (lower.includes('shiksha') || lower.includes('student') || lower.includes('education') || lower.includes('scholarship')) return '🎓';
    return '🎯';
  };

  return (
    <div className="premium-card p-6 border flex flex-col gap-4 relative overflow-hidden transition-all duration-300 text-left">
      
      {/* Tricolor top indicator border line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]"></div>

      {/* Top section: Icon, Title, Actions */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-light border border-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
            {getSchemeIcon(scheme.schemeTitle)}
          </div>
          <div>
            <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-orange-50 text-accent uppercase tracking-wider mb-1">
              Indian Civic Welfare
            </span>
            <h3 className="font-display font-extrabold text-lg text-slate-800 leading-snug">
              {scheme.schemeTitle}
            </h3>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex gap-1.5 flex-shrink-0">
          {/* Play/Stop Audio */}
          <button
            onClick={handleSpeak}
            className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-colors cursor-pointer ${
              isSpeaking
                ? 'bg-accent text-white border-accent'
                : 'bg-sky-50 border-sky-100 text-slate-600 hover:bg-sky-100'
            }`}
            title="Read scheme details"
          >
            {isSpeaking ? <FiVolumeX className="w-4 h-4" /> : <FiVolume2 className="w-4 h-4" />}
          </button>

          {/* Bookmark save */}
          <button
            onClick={isSaved ? onUnsave : onSave}
            className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all cursor-pointer ${
              isSaved
                ? 'bg-primary text-white border-primary shadow-sm shadow-primary/25'
                : 'bg-sky-50 border-sky-100 text-slate-655 hover:bg-sky-100'
            }`}
            title={isSaved ? "Remove Bookmark" : "Bookmark Scheme"}
          >
            <FiBookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-1">
        <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
          Quick Summary
        </span>
        <p className="text-sm text-slate-600 leading-relaxed font-semibold">
          {cleanDesc}
        </p>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
        <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-100/50">
          <span className="block text-[9px] font-extrabold text-slate-400 uppercase mb-1.5 tracking-wider">
            {t.schemeEligibility}
          </span>
          <span className="text-xs font-bold text-slate-700">
            {scheme.eligibility}
          </span>
        </div>

        <div className="p-3.5 bg-green-50/20 rounded-2xl border border-green-150/40">
          <span className="block text-[9px] font-extrabold text-slate-400 uppercase mb-1.5 tracking-wider">
            {t.schemeBenefits}
          </span>
          <span className="text-xs font-extrabold text-primary">
            {scheme.benefits}
          </span>
        </div>
      </div>

      {/* Accordion list */}
      {stepsList.length > 0 && (
        <div className="pt-2 border-t border-slate-100 mt-1">
          <button
            onClick={() => setShowSteps(!showSteps)}
            className="text-xs font-bold text-primary flex items-center gap-1 hover:underline cursor-pointer"
          >
            {showSteps ? (
              <>
                <span>Hide application steps</span>
                <FiChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Show application steps</span>
                <FiChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          {showSteps && (
            <ol className="mt-3.5 space-y-2 text-xs pl-4 list-decimal text-slate-600 leading-relaxed font-semibold">
              {stepsList.map((step, idx) => (
                <li key={idx} className="pl-1">
                  {step.split(/(\[.*?\]\(.*?\))/g).map((part, pIdx) => {
                    const match = part.match(/\[(.*?)\]\((.*?)\)/);
                    if (match) {
                      return (
                        <a
                          key={pIdx}
                          href={match[2]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary font-extrabold hover:underline inline-flex items-center gap-0.5"
                        >
                          {match[1]} ↗
                        </a>
                      );
                    }
                    return part;
                  })}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {/* Online portals */}
      {applyUrl && (
        <div className="pt-2 mt-auto">
          <a
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-gradient-to-br from-primary to-emerald-600 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-primary/10 transition-all hover:scale-101"
          >
            <span>Apply Online at {applyText || 'portal'}</span>
            <FiExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

    </div>
  );
};

export default SchemeCard;
