import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ComplaintCard from '../components/ComplaintCard';
import SchemeCard from '../components/SchemeCard';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
  FiMic,
  FiFileText,
  FiAlertCircle,
  FiAward,
  FiBookOpen,
  FiGlobe,
  FiTrendingUp,
  FiBookmark,
  FiMessageSquare,
  FiCalendar,
  FiPlay,
  FiArrowRight,
  FiSearch
} from 'react-icons/fi';

const Dashboard = () => {
  const { user, recentComplaints, recentSavedSchemes, fetchProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    fetchProfile().catch((err) => console.error('Dashboard stats fetch error:', err));
  }, []);

  const handleUnsave = async (schemeId) => {
    try {
      await api.delete(`/schemes/saved/${schemeId}`);
      await fetchProfile();
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
  };

  const handleStatusUpdate = async (id, nextStatus) => {
    try {
      await api.patch(`/complaint/${id}`, { status: nextStatus });
      await fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    navigate(`/chat?query=${encodeURIComponent(searchVal)}`);
  };

  const handleSuggestedClick = (text) => {
    navigate(`/chat?query=${encodeURIComponent(text)}`);
  };

  const greeting = () => {
    const hours = new Date().getHours();
    let greet = 'Welcome';
    if (hours < 12) greet = 'Good Morning';
    else if (hours < 17) greet = 'Good Afternoon';
    else greet = 'Good Evening';

    const prefix = t.title === 'सेवा सेतु AI' ? 'नमस्ते' : 'Hello';
    return `${prefix}, ${user?.name || 'Citizen'} 👋`;
  };

  const suggestedQuestions = [
    { label: 'How to get a Passport?', query: 'How do I apply for an Indian Passport?' },
    { label: 'File Complaint', query: 'I want to draft a local civic complaint' },
    { label: 'PMAY Benefits', query: 'What is Pradhan Mantri Awas Yojana?' },
    { label: 'Scholarships', query: 'Show me student scholarships' }
  ];

  const quickActions = [
    {
      title: 'AI Assistant',
      desc: 'Talk to Seva Setu in your own local language.',
      icon: <FiMic className="w-6 h-6 text-[#FF9933]" />,
      path: '/chat',
      colorClass: 'bg-orange-50/50 border-orange-200/50 hover:bg-orange-50 text-slate-800'
    },
    {
      title: 'Documents Guide',
      desc: 'Generate checklists for applications and licenses.',
      icon: <FiFileText className="w-6 h-6 text-[#138808]" />,
      path: '/documents',
      colorClass: 'bg-green-50/50 border-green-200/50 hover:bg-green-50 text-slate-800'
    },
    {
      title: 'File Complaint',
      desc: 'Draft and track formal grievance applications.',
      icon: <FiAlertCircle className="w-6 h-6 text-[#FF9933]" />,
      path: '/complaint',
      colorClass: 'bg-orange-50/50 border-orange-200/50 hover:bg-orange-50 text-slate-800'
    },
    {
      title: 'Welfare Schemes',
      desc: 'Discover government aid benefits and criteria.',
      icon: <FiAward className="w-6 h-6 text-[#138808]" />,
      path: '/schemes',
      colorClass: 'bg-green-50/50 border-green-200/50 hover:bg-green-50 text-slate-800'
    },
    {
      title: 'Explain Simply',
      desc: 'Translate complex circular jargon into plain terms.',
      icon: <FiBookOpen className="w-6 h-6 text-[#FF9933]" />,
      path: '/chat?query=Explain simple terms for central guidelines',
      colorClass: 'bg-orange-50/50 border-orange-200/50 hover:bg-orange-50 text-slate-800'
    },
    {
      title: 'Language Setup',
      desc: 'Set system local dialect configurations.',
      icon: <FiGlobe className="w-6 h-6 text-[#138808]" />,
      path: '/profile',
      colorClass: 'bg-green-50/50 border-green-200/50 hover:bg-green-50 text-slate-800'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-10 pb-16 max-w-6xl mx-auto relative z-10"
    >
      
      {/* 1. Welcome Greeting Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#138808] via-emerald-600 to-[#FF9933] text-white p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Banner Details */}
        <div className="space-y-2 text-left z-10 flex-1">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight">
            {greeting()}
          </h2>
          <p className="text-sm text-white/90 max-w-md font-medium leading-relaxed">
            How can I help you today? Access welfare schemes, generate checklists, or draft complaints instantly.
          </p>
        </div>

        {/* Removed Mascot Robot Illustration as requested */}
      </div>

      {/* 2. Google Gemini-style Search Box */}
      <div className="premium-card p-6 border text-left space-y-4">
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
          {t.askCompanion || 'Ask AI Companion'}
        </h3>
        
        <form onSubmit={handleSearchSubmit} className="relative w-full bg-sky-50 border-2 border-sky-150 focus-within:border-accent p-2 rounded-2xl flex items-center transition-all duration-300">
          <span className="pl-3 text-slate-400">
            <FiSearch className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Ask anything about government services..."
            className="w-full pl-3 pr-20 py-2.5 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none text-base"
          />
          <div className="absolute right-2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleSuggestedClick('Draft a complaint about public roads')}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-accent hover:bg-sky-100 transition-colors"
            >
              <FiMic className="w-4.5 h-4.5" />
            </button>
            <button
              type="submit"
              className="w-9 h-9 rounded-full bg-accent hover:bg-amber-600 text-white flex items-center justify-center shadow-md shadow-accent/20 transition-all cursor-pointer"
            >
              <FiArrowRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </form>

        {/* Suggested Queries */}
        <div className="flex flex-wrap gap-2 pt-1">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestedClick(q.query)}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-650 bg-sky-50 border border-sky-100/50 rounded-full hover:bg-primary-light hover:text-primary transition-all cursor-pointer"
            >
              • {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Quick Action Feature Tiles */}
      <div className="space-y-4">
        <h3 className="font-display font-extrabold text-xl text-slate-800 flex items-center gap-2">
          <span>⚡</span>
          <span>{t.quickActions || 'Quick Actions'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, idx) => {
            let title = action.title;
            let desc = action.desc;
            if (idx === 0) {
              title = t.navChat || action.title;
              desc = t.voiceFirstDesc || action.desc;
            } else if (idx === 1) {
              title = t.docChecklist || action.title;
              desc = t.docChecklistDesc || action.desc;
            } else if (idx === 2) {
              title = t.complaints || action.title;
              desc = t.complaintsDesc || action.desc;
            } else if (idx === 3) {
              title = t.schemes || action.title;
              desc = t.schemesDesc || action.desc;
            } else if (idx === 4) {
              title = t.simpleLang || action.title;
              desc = t.simpleLangDesc || action.desc;
            } else if (idx === 5) {
              title = t.defaultLang || action.title;
              desc = t.navSettings || action.desc;
            }

            return (
              <Link
                key={idx}
                to={action.path}
                className={`premium-card p-5 border text-left flex gap-4 transition-all duration-300 group hover:scale-[1.02] cursor-pointer ${action.colorClass}`}
              >
                <div className="p-3 bg-white border border-slate-200/40 rounded-2xl shadow-sm flex-shrink-0 flex items-center justify-center h-12 w-12 group-hover:rotate-6 transition-transform">
                  {action.icon}
                </div>
                <div className="space-y-1 relative w-full pr-6">
                  <h4 className="font-bold text-sm text-slate-800">{title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">{desc}</p>
                  <FiArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-slate-400 w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 4. Tracking and Schemes Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        
        {/* Grievance Timeline Tracker */}
        <div className="space-y-4">
          <h3 className="font-display font-extrabold text-lg text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FiAlertCircle className="text-accent" />
              <span>{t.complaintTracker || 'Grievance Tracker'}</span>
            </span>
            <Link to="/complaint" className="text-xs font-bold text-primary hover:underline">
              View History
            </Link>
          </h3>

          <div className="space-y-4">
            {recentComplaints.length > 0 ? (
              <div className="relative pl-6 space-y-6 text-left">
                <div className="timeline-line"></div>
                {recentComplaints.map((comp) => {
                  let dotBg = 'bg-orange-500';
                  if (comp.status === 'Resolved') dotBg = 'bg-green-500';
                  else if (comp.status === 'In Review') dotBg = 'bg-blue-500';

                  return (
                    <div key={comp._id} className="relative">
                      <div className={`absolute -left-[30px] top-6 w-3 h-3 rounded-full border-2 border-white z-10 ${dotBg}`}></div>
                      <ComplaintCard
                        complaint={comp}
                        onStatusUpdate={handleStatusUpdate}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-dashed border-sky-100 text-center text-xs text-slate-400 bg-sky-50/15 flex flex-col items-center justify-center gap-3">
                <svg className="w-12 h-12 stroke-current text-sky-300" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
                <p className="font-semibold text-slate-500">Everything looks clean!</p>
                <p className="text-[10px]">No active complaints registered. Speak to Seva Setu to register a report.</p>
              </div>
            )}
          </div>
        </div>

        {/* Bookmarked Welfare Schemes */}
        <div className="space-y-4">
          <h3 className="font-display font-extrabold text-lg text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FiAward className="text-primary" />
              <span>{t.savedSchemes}</span>
            </span>
            <Link to="/schemes" className="text-xs font-bold text-primary hover:underline">
              Explore Schemes
            </Link>
          </h3>

          <div className="space-y-4">
            {recentSavedSchemes.length > 0 ? (
              recentSavedSchemes.map((scheme) => (
                <div key={scheme._id} className="text-left">
                  <SchemeCard
                    scheme={scheme}
                    isSaved={true}
                    onUnsave={() => handleUnsave(scheme._id)}
                  />
                </div>
              ))
            ) : (
              <div className="p-8 rounded-2xl border border-dashed border-sky-100 text-center text-xs text-slate-400 bg-sky-50/15 flex flex-col items-center justify-center gap-3">
                <FiAward className="w-12 h-12 text-sky-300" />
                <p className="font-semibold text-slate-500">No bookmarked schemes</p>
                <p className="text-[10px]">Configure your profile criteria to explore welfare program recommendations.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </motion.div>
  );
};

export default Dashboard;
