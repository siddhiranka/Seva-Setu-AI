import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import SchemeCard from '../components/SchemeCard';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
  FiUser,
  FiMail,
  FiLock,
  FiCheckCircle,
  FiAlertCircle,
  FiBookmark,
  FiGlobe,
  FiAward,
  FiActivity,
  FiShield
} from 'react-icons/fi';

const Profile = () => {
  const { user, recentSavedSchemes, recentComplaints, updateProfile, fetchProfile } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [prefLang, setPrefLang] = useState('en');
  const [password, setPassword] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Hydrate form on load
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPrefLang(user.preferredLanguage || 'en');
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const data = {
        name,
        preferredLanguage: prefLang,
      };
      if (password.trim()) {
        data.password = password;
      }

      await updateProfile(data);
      setSuccess('Profile updated successfully!');
      setPassword('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile settings.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnsave = async (schemeId) => {
    try {
      await api.delete(`/schemes/saved/${schemeId}`);
      await fetchProfile(); // reload recents/bookmarks
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-10 pb-20 max-w-6xl mx-auto text-left relative z-10"
    >
      {/* 1. Clean Profile Header */}
      <div className="premium-card p-6 sm:p-8 border flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-primary-light to-emerald-100 flex items-center justify-center text-4xl sm:text-5xl font-extrabold text-primary border-4 border-white shadow-lg flex-shrink-0">
          {user?.name ? user.name[0].toUpperCase() : 'C'}
        </div>
        
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-800 tracking-tight">
              {user?.name || 'Citizen Profile'}
            </h2>
            <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-green-100 border border-green-200 text-[10px] font-black text-green-700 uppercase tracking-widest w-max mx-auto sm:mx-0">
              <FiShield className="w-3 h-3" /> Verified
            </span>
          </div>
          <p className="text-slate-500 text-sm font-semibold flex items-center justify-center sm:justify-start gap-2">
            <FiMail className="w-4 h-4 text-slate-400" />
            {user?.email || 'citizen@sevasetu.in'}
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-6 px-5 py-3 rounded-2xl bg-sky-50/50 border border-sky-100">
          <div className="text-center">
            <span className="block text-2xl font-black text-primary">{recentSavedSchemes?.length || 0}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Saved</span>
          </div>
          <div className="w-px bg-sky-200"></div>
          <div className="text-center">
            <span className="block text-2xl font-black text-accent">{recentComplaints?.length || 0}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Reports</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-3 bg-danger/10 border border-danger/20 text-danger rounded-2xl flex items-center gap-3 text-sm font-bold shadow-sm">
          <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
      {success && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-sm">
          <FiCheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Settings Form Column (Left 5 cols) */}
        <div className="lg:col-span-5">
          <div className="premium-card p-5 border relative overflow-hidden">
            <h3 className="font-display font-extrabold text-base text-slate-800 pb-3 border-b border-slate-100 flex items-center gap-2">
              <FiUser className="text-primary" />
              Account Settings
            </h3>

            <form onSubmit={handleUpdate} className="space-y-3 pt-3">
              {/* Name & Email side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                    {t.fullName || 'Full Name'}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <FiUser className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary rounded-xl focus:outline-none text-sm transition-all font-bold text-slate-700"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                    {t.emailAddress || 'Email'}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <FiMail className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="email"
                      value={user?.email || ''}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-100/50 border border-slate-200 rounded-xl text-sm cursor-not-allowed font-semibold text-slate-500"
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Language & Password side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                    {t.defaultLang || 'Language'}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <FiGlobe className="w-3.5 h-3.5" />
                    </span>
                    <select
                      value={prefLang}
                      onChange={(e) => setPrefLang(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-accent rounded-xl focus:outline-none text-sm transition-all cursor-pointer font-bold text-slate-700 appearance-none"
                    >
                      <option value="en">English</option>
                      <option value="hi">हिंदी</option>
                      <option value="mr">मराठी</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                      <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                    {t.changePassword || 'New Password'}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <FiLock className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Leave blank to keep"
                      autoComplete="new-password"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary rounded-xl focus:outline-none text-sm transition-all font-bold text-slate-700"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{t.saveSettings || 'Save Changes'}</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Saved Schemes List Column (Right 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-extrabold text-lg text-slate-800 flex items-center gap-2">
              <span className="p-1.5 bg-orange-100 text-[#FF9933] rounded-lg">
                <FiBookmark className="w-4 h-4" />
              </span>
              <span>Saved Schemes</span>
            </h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {recentSavedSchemes.length} Total
            </span>
          </div>

          <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
            {recentSavedSchemes.length > 0 ? (
              recentSavedSchemes.map((scheme) => (
                <SchemeCard
                  key={scheme._id}
                  scheme={scheme}
                  isSaved={true}
                  onUnsave={() => handleUnsave(scheme._id)}
                />
              ))
            ) : (
              <div className="p-10 text-center border-2 border-dashed border-sky-100 rounded-3xl text-sm text-slate-400 bg-gradient-to-b from-sky-50/30 to-white flex flex-col items-center justify-center gap-3">
                <FiBookmark className="w-10 h-10 text-slate-300" />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-700 text-sm">No Saved Schemes Yet</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Discover and bookmark welfare programs from the Schemes page.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default Profile;
