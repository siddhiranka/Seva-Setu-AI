import React, { useState, useEffect } from 'react';
import { FiClock, FiAlertTriangle, FiInfo, FiExternalLink, FiFileText, FiMapPin, FiCreditCard, FiImage } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const DocumentChecklist = ({ checklist }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [checkedDocs, setCheckedDocs] = useState({});

  const storageKey = user
    ? `seva_setu_checklist_${user._id}_${checklist.service}`
    : `seva_setu_checklist_guest_${checklist.service}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setCheckedDocs(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      setCheckedDocs({});
    }
  }, [checklist.service, storageKey]);

  const toggleDoc = (docRaw) => {
    const updated = {
      ...checkedDocs,
      [docRaw]: !checkedDocs[docRaw],
    };
    setCheckedDocs(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const docs = checklist.documents || [];
  const completedCount = docs.filter((doc) => checkedDocs[doc]).length;
  const progressPercent = docs.length > 0 ? Math.round((completedCount / docs.length) * 100) : 0;

  // SVG Progress Ring Parameters
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Helper to parse document name, links, and badges
  const parseDocument = (docStr) => {
    let name = docStr;
    let isRequired = true; // default
    let linkUrl = '';
    let linkText = '';

    // Check required/optional
    if (name.includes('(Optional)')) {
      isRequired = false;
      name = name.replace('(Optional)', '').trim();
    } else if (name.includes('(Required)')) {
      name = name.replace('(Required)', '').trim();
    }

    // Check markdown link [text](url)
    const linkMatch = name.match(/\[(.*?)\]\((.*?)\)/);
    if (linkMatch) {
      linkText = linkMatch[1];
      linkUrl = linkMatch[2];
      name = name.replace(/\[.*?\]\(.*?\)/, '').replace(/-\s*Apply at\s*/i, '').trim();
    }

    // Dynamic icon picker
    let icon = <FiFileText className="w-5 h-5 text-primary" />;
    const lowerName = name.toLowerCase();
    if (lowerName.includes('aadhaar') || lowerName.includes('id proof') || lowerName.includes('card')) {
      icon = <FiCreditCard className="w-5 h-5 text-accent" />;
    } else if (lowerName.includes('address') || lowerName.includes('utility') || lowerName.includes('bill') || lowerName.includes('rent')) {
      icon = <FiMapPin className="w-5 h-5 text-emerald-600" />;
    } else if (lowerName.includes('photo') || lowerName.includes('photograph') || lowerName.includes('camera')) {
      icon = <FiImage className="w-5 h-5 text-accent" />;
    }

    return { name, isRequired, linkUrl, linkText, icon };
  };

  return (
    <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-md flex flex-col gap-6 text-left">
      
      {/* Header with Progress Ring */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-black text-accent uppercase block mb-1">Document Guide</span>
          <h3 className="font-display font-extrabold text-2xl text-slate-800">
            {checklist.service}
          </h3>
        </div>

        {/* SVG Progress Ring */}
        {docs.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  className="stroke-sky-100 fill-none"
                  strokeWidth="5"
                />
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  className="stroke-primary fill-none transition-all duration-500 ease-out"
                  strokeWidth="5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[10px] font-extrabold text-slate-700">
                {progressPercent}%
              </span>
            </div>
            <div className="hidden sm:block text-right">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Documents</span>
              <span className="text-xs font-extrabold text-slate-700">
                {completedCount} of {docs.length}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Meta Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-sky-50/50 rounded-2xl flex items-center gap-3 border border-sky-100/50">
          <div className="p-2.5 rounded-xl bg-green-50 text-primary">
            <FiInfo className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Eligibility Criteria</span>
            <span className="text-sm font-bold text-slate-700">
              {checklist.eligibility || 'All eligible citizens'}
            </span>
          </div>
        </div>

        <div className="p-4 bg-sky-50/50 rounded-2xl flex items-center gap-3 border border-sky-100/50">
          <div className="p-2.5 rounded-xl bg-orange-50 text-accent">
            <FiClock className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Estimated Timeline</span>
            <span className="text-sm font-bold text-slate-700">
              {checklist.estimated_time || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
          {t.requiredChecklist || 'Required Files Checklist'}
        </span>

        {docs.length > 0 ? (
          <div className="space-y-3">
            {docs.map((docRaw, idx) => {
              const { name, isRequired, linkUrl, linkText, icon } = parseDocument(docRaw);
              const isChecked = !!checkedDocs[docRaw];

              return (
                <div
                  key={idx}
                  onClick={() => toggleDoc(docRaw)}
                  className={`premium-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer border ${
                    isChecked
                      ? 'bg-green-50/20 border-green-200'
                      : 'bg-white border-sky-100'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox status indicator */}
                    <div className="mt-1 flex-shrink-0">
                      <div className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isChecked
                          ? 'bg-primary border-primary text-white'
                          : 'border-sky-200'
                      }`}>
                        {isChecked && <span className="text-[10px] font-bold">✔</span>}
                      </div>
                    </div>

                    {/* Icon & Label */}
                    <div className="flex gap-3">
                      <div className="p-2 bg-sky-50 rounded-xl flex-shrink-0 h-10 w-10 flex items-center justify-center border border-sky-100/70">
                        {icon}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-bold text-slate-800 ${isChecked ? 'line-through opacity-50' : ''}`}>
                            {name}
                          </h4>
                          {/* Required/Optional Tag */}
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                            isRequired
                              ? 'bg-orange-50 text-[#FF9933] border-orange-200'
                              : 'bg-sky-50 text-slate-555 border-sky-100'
                          }`}>
                            {isRequired ? 'Required' : 'Optional'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-normal max-w-lg font-medium">
                          {t.verifyDoc || 'Verify validity of document details against official registries before submission.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Online application link */}
                  {linkUrl && (
                    <a
                      href={linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="sm:ml-auto px-4 py-2 border border-primary/20 hover:bg-primary-light text-primary font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all self-start sm:self-center"
                    >
                      <span>{linkText || 'Apply Online'}</span>
                      <FiExternalLink className="w-3.5 h-3.5" strokeWidth="2.5" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-slate-500 text-center py-6">No documents found.</div>
        )}
      </div>

      {/* Reminders section */}
      {checklist.important_notes && checklist.important_notes.length > 0 && (
        <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl flex gap-3">
          <div className="text-amber-600 flex-shrink-0 mt-0.5">
            <FiAlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-widest block">
              Important Reminders
            </span>
            <ul className="list-disc pl-4 space-y-1 text-xs text-amber-700 leading-relaxed font-semibold">
              {checklist.important_notes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

    </div>
  );
};

export default DocumentChecklist;
