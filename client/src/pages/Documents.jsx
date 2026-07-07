import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import useSpeech from '../hooks/useSpeech';
import DocumentChecklist from '../components/DocumentChecklist';
import Loader from '../components/Loader';
import api from '../services/api';
import { FiSearch, FiFileText, FiAlertCircle, FiMic, FiMicOff } from 'react-icons/fi';

const Documents = () => {
  const { t, language } = useLanguage();
  const { isListening, startListening, stopListening } = useSpeech();
  
  const [serviceQuery, setServiceQuery] = useState('');
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchChecklist = async (serviceName) => {
    const query = serviceName || serviceQuery;
    if (!query.trim()) return;

    setError('');
    setLoading(true);
    setChecklist(null);

    try {
      const response = await api.post('/chat/checklist', {
        service: query,
        language
      });
      setChecklist(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to generate document checklist. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((transcript) => {
        setServiceQuery(transcript);
        fetchChecklist(transcript);
      });
    }
  };

  const commonServices = [
    { name: 'Passport', icon: '🛂' },
    { name: 'Ration Card', icon: '🌾' },
    { name: 'Aadhaar Card', icon: '💳' },
    { name: 'Income Certificate', icon: '💰' },
    { name: 'Caste Certificate', icon: '📜' },
    { name: 'Driving License', icon: '🚗' },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-fade-in">
      
      {/* Split layout: Headline & Illustration */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-primary-light to-white p-6 rounded-3xl border border-primary/10">
        <div className="space-y-2 text-left flex-1">
          <h2 className="font-display font-extrabold text-3xl text-slate-800">
            {t.navDocuments}
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed max-w-md font-semibold">
            Type or speak the name of a government service to instantly generate your custom document checklist.
          </p>
        </div>
        
        {/* Document illustration */}
        <div className="w-40 h-40 flex-shrink-0 animate-float">
          <svg className="w-full h-full" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="45" fill="#FFF2E5" />
            {/* Shield / Document Shape */}
            <rect x="42" y="32" width="36" height="48" rx="6" fill="#FFFFFF" stroke="#FF9933" strokeWidth="3" filter="drop-shadow(0px 4px 8px rgba(0,0,0,0.05))"/>
            {/* Checklist lines */}
            <line x1="50" y1="44" x2="70" y2="44" stroke="#138808" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="50" y1="54" x2="66" y2="54" stroke="#138808" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="50" y1="64" x2="58" y2="64" stroke="#FF9933" strokeWidth="2.5" strokeLinecap="round"/>
            {/* Checked checkmarks */}
            <circle cx="76" cy="76" r="14" fill="#138808" />
            <path d="M71 76l3 3 5-5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-danger/10 border border-danger/20 text-danger rounded-2xl flex items-center gap-3 text-sm">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input controls */}
      <div className="premium-card p-6 border space-y-4 text-left">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchChecklist();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          {/* Text search */}
          <div className="flex-1 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <FiFileText />
            </span>
            <input
              type="text"
              value={serviceQuery}
              onChange={(e) => setServiceQuery(e.target.value)}
              placeholder="Enter service name (e.g. Ration Card)"
              className="w-full pl-10 pr-4 py-3 bg-sky-50 border-2 border-sky-150 focus:border-accent rounded-2xl focus:outline-none text-sm transition-all font-bold"
              disabled={loading || isListening}
            />
          </div>

          <div className="flex gap-2">
            {/* Mic trigger */}
            <button
              type="button"
              onClick={handleVoiceInput}
              disabled={loading}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white border-red-500 animate-pulse shadow-md shadow-red-500/25 scale-105'
                  : 'bg-sky-50 border-sky-150 text-slate-655 hover:bg-sky-100'
              }`}
              title="Speak service name"
              aria-label="Speak service name"
            >
              <FiMic className={`w-5 h-5 ${isListening ? 'animate-bounce' : ''}`} />
            </button>

            {/* Fetch */}
            <button
              type="submit"
              disabled={loading || isListening || !serviceQuery.trim()}
              className="px-6 py-3 bg-primary hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-primary/10 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FiSearch className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>
        </form>

        {/* Shortcuts */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            {t.popularServices}
          </span>
          <div className="flex flex-wrap gap-2.5">
            {commonServices.map((service, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setServiceQuery(service.name);
                  fetchChecklist(service.name);
                }}
                disabled={loading || isListening}
                className="px-4 py-2 bg-sky-50/50 hover:bg-sky-100 border border-sky-100/75 text-xs font-semibold text-slate-700 rounded-xl transition-all hover:scale-102 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>{service.icon}</span>
                <span>{service.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && <Loader />}

      {/* Result Display */}
      {checklist && <DocumentChecklist checklist={checklist} />}
    </div>
  );
};

export default Documents;
