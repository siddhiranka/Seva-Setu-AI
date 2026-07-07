import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import SchemeCard from '../components/SchemeCard';
import Loader from '../components/Loader';
import api from '../services/api';
import { FiAward, FiSearch, FiAlertCircle, FiFilter } from 'react-icons/fi';

const Schemes = () => {
  const { t, language } = useLanguage();
  const { fetchProfile } = useAuth();

  // Form states
  const [age, setAge] = useState('');
  const [occupation, setOccupation] = useState('');
  const [incomeRange, setIncomeRange] = useState('');
  const [isStudent, setIsStudent] = useState(false);
  const [isSenior, setIsSenior] = useState(false);
  const [location, setLocation] = useState('');

  const [recommended, setRecommended] = useState([]);
  const [savedSchemes, setSavedSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch bookmarks on load
  useEffect(() => {
    fetchSavedSchemes();
  }, []);

  const fetchSavedSchemes = async () => {
    try {
      const response = await api.get('/schemes/saved');
      setSavedSchemes(response.data);
    } catch (err) {
      console.error('Error fetching bookmarked schemes:', err);
    }
  };

  const handleRecommend = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setRecommended([]);

    try {
      const response = await api.post('/schemes/recommend', {
        age: parseInt(age) || null,
        occupation,
        incomeRange,
        isStudent,
        isSenior: isSenior || (parseInt(age) >= 60),
        location,
        language
      });
      setRecommended(response.data);
    } catch (err) {
      console.error(err);
      setError('Could not recommend schemes. Check your parameters.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (scheme) => {
    try {
      await api.post('/schemes/save', {
        schemeTitle: scheme.schemeTitle,
        description: scheme.description,
        benefits: scheme.benefits,
        eligibility: scheme.eligibility,
        applySteps: scheme.applySteps
      });
      await fetchSavedSchemes();
      await fetchProfile();
    } catch (err) {
      console.error('Save scheme error:', err);
    }
  };

  const handleUnsave = async (schemeTitle) => {
    const saved = savedSchemes.find(s => s.schemeTitle === schemeTitle);
    if (!saved) return;

    try {
      await api.delete(`/schemes/saved/${saved._id}`);
      await fetchSavedSchemes();
      await fetchProfile();
    } catch (err) {
      console.error('Unsave scheme error:', err);
    }
  };

  const isBookmarked = (title) => {
    return savedSchemes.some(s => s.schemeTitle === title);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-fade-in text-left">
      
      {/* Headline banner with SVG cartoon illustration */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-primary-light to-white p-6 rounded-3xl border border-primary/10">
        <div className="space-y-2 text-left flex-1">
          <h2 className="font-display font-extrabold text-3xl text-slate-800">
            {t.navSchemes}
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed max-w-md font-semibold">
            Provide demographic parameters to search Indian Welfare Schemes matching your profile criteria.
          </p>
        </div>

        {/* Welfare Discovery Illustration */}
        <div className="w-40 h-40 flex-shrink-0 animate-float">
          <svg className="w-full h-full" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="45" fill="#EAF8EC" />
            {/* Government Helping badge */}
            <path d="M40 82h40v12H40V82z" fill="#FF9933" />
            <rect x="44" y="38" width="32" height="44" rx="4" fill="#FFFFFF" stroke="#138808" strokeWidth="2.5" />
            {/* Saffron Ribbon Badge */}
            <path d="M50 48l10 8 10-8v22l-10-6-10 6V48z" fill="#FF9933" opacity="0.85"/>
            <circle cx="60" cy="48" r="4" fill="#138808" />
          </svg>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-danger/10 border border-danger/20 text-danger rounded-2xl flex items-center gap-3 text-sm">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="premium-card p-6 border text-left">
        <form onSubmit={handleRecommend} className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
            <FiFilter className="text-accent w-5 h-5" />
            <h3 className="font-display font-extrabold text-lg text-slate-800">
              Demographic Parameters
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Age */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {t.formAge}
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="E.g. 35"
                min="1"
                max="120"
                className="w-full px-4 py-3 bg-sky-50 border-2 border-sky-150 focus:border-accent rounded-2xl focus:outline-none text-sm transition-all font-bold"
                required
              />
            </div>

            {/* Occupation */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {t.formOccupation}
              </label>
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full px-4 py-3 bg-sky-50 border-2 border-sky-150 focus:border-accent rounded-2xl focus:outline-none text-sm transition-all cursor-pointer font-bold"
                required
              >
                <option value="">Select Occupation</option>
                <option value="Farmer">Farmer (किसान)</option>
                <option value="Student">Student (छात्र)</option>
                <option value="Business Owner">Business Owner (व्यवसायी)</option>
                <option value="Laborer">Daily Wage Laborer (मजदूर)</option>
                <option value="Unemployed">Unemployed (बेरोजगार)</option>
                <option value="Retired">Retired (सेवानिवृत्त)</option>
              </select>
            </div>

            {/* Income Range */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {t.formIncome}
              </label>
              <select
                value={incomeRange}
                onChange={(e) => setIncomeRange(e.target.value)}
                className="w-full px-4 py-3 bg-sky-50 border-2 border-sky-150 focus:border-accent rounded-2xl focus:outline-none text-sm transition-all cursor-pointer font-bold"
                required
              >
                <option value="">Select Income Range</option>
                <option value="Below 1 Lakh">Below 1,00,000</option>
                <option value="1 Lakh to 3 Lakhs">1,00,000 - 3,00,000</option>
                <option value="3 Lakhs to 5 Lakhs">3,00,000 - 5,00,000</option>
                <option value="Above 5 Lakhs">Above 5,00,000</option>
              </select>
            </div>

            {/* State/Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {t.formLocation}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="E.g. Maharashtra"
                className="w-full px-4 py-3 bg-sky-50 border-2 border-sky-150 focus:border-accent rounded-2xl focus:outline-none text-sm transition-all font-bold"
                required
              />
            </div>

            {/* Student Checkbox */}
            <div className="space-y-1.5 flex flex-col justify-end min-h-[58px]">
              <span className="hidden sm:block text-xs font-bold text-transparent select-none">Student Spacer</span>
              <label className="flex items-center gap-3 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={isStudent}
                  onChange={(e) => setIsStudent(e.target.checked)}
                  className="w-5 h-5 rounded border-sky-200 text-primary focus:ring-primary cursor-pointer"
                />
                <span className="text-sm font-bold text-slate-700">
                  {t.formStudent}
                </span>
              </label>
            </div>

            {/* Senior Checkbox */}
            <div className="space-y-1.5 flex flex-col justify-end min-h-[58px]">
              <span className="hidden sm:block text-xs font-bold text-transparent select-none">Senior Spacer</span>
              <label className="flex items-center gap-3 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={isSenior}
                  onChange={(e) => setIsSenior(e.target.checked)}
                  className="w-5 h-5 rounded border-sky-200 text-primary focus:ring-primary cursor-pointer"
                />
                <span className="text-sm font-bold text-slate-700">
                  {t.formSenior}
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3.5 bg-primary hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <FiSearch className="w-5 h-5" />
            <span>{t.formSearchBtn}</span>
          </button>
        </form>
      </div>

      {/* Loading Spinner */}
      {loading && <Loader />}

      {/* Results grid */}
      {recommended.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-display font-extrabold text-xl text-slate-800">
            {t.schemeMatch} ({recommended.length})
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {recommended.map((scheme, idx) => {
              const bookmarked = isBookmarked(scheme.schemeTitle);
              return (
                <SchemeCard
                  key={idx}
                  scheme={scheme}
                  isSaved={bookmarked}
                  onSave={() => handleSave(scheme)}
                  onUnsave={() => handleUnsave(scheme.schemeTitle)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Fallback empty recommendation list */}
      {!loading && recommended.length === 0 && (
        <div className="p-12 text-center border border-dashed border-sky-100 rounded-3xl text-sm text-slate-400 bg-sky-50/15 flex flex-col items-center justify-center gap-3">
          <FiAward className="w-12 h-12 text-slate-200" />
          <p className="font-bold text-slate-650">No schemes searched yet.</p>
          <p className="text-xs">Fill out the questionnaire parameters above to fetch government benefits advice.</p>
        </div>
      )}
    </div>
  );
};

export default Schemes;
