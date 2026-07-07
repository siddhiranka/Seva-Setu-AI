import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FiUser, FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';

const Register = () => {
  const { register, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || 'dashboard';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [prefLang, setPrefLang] = useState('en');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Preserve other search params (like query) when redirecting
      const params = new URLSearchParams(searchParams);
      params.delete('redirect');
      const queryString = params.toString();
      navigate(`/${redirect}${queryString ? '?' + queryString : ''}`);
    }
  }, [user, navigate, redirect, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      return setError('Please fill in all fields');
    }

    try {
      setError('');
      setLoading(true);
      await register(name, email, password, prefLang);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-sky-50 via-blue-50 to-white">
      <div className="w-full max-w-md bg-white border border-sky-200 rounded-3xl p-8 shadow-xl shadow-sky-100 space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-3">
            <FiUser className="w-7 h-7" />
          </div>
          <h2 className="font-display font-extrabold text-3xl text-slate-800">
            Create Account
          </h2>
          <p className="text-sm text-slate-500">
            Sign up to access personalized civic guides
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-danger/10 border border-danger/20 text-danger flex items-center gap-3 text-sm">
            <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-sky-600 uppercase tracking-wider block">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-sky-400">
                <FiUser />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohan Sharma"
                autoComplete="name"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-sky-200 bg-sky-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-sky-600 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-sky-400">
                <FiMail />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rohan@gmail.com"
                autoComplete="email"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-sky-200 bg-sky-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-sky-600 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-sky-400">
                <FiLock />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-sky-200 bg-sky-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-sky-600 uppercase tracking-wider block">
              Preferred Language
            </label>
            <div className="flex gap-2">
              {[
                { code: 'en', label: 'English' },
                { code: 'hi', label: 'हिंदी' },
                { code: 'mr', label: 'मराठी' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setPrefLang(lang.code)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                    prefLang === lang.code
                      ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                      : 'bg-white border-sky-200 text-slate-700 hover:bg-sky-50'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-primary hover:bg-primary-light text-white font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center justify-center cursor-pointer"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500 pt-2">
          Already have an account?{' '}
          <Link
            to={`/login?redirect=${redirect}`}
            className="font-bold text-sky-600 hover:text-sky-700 hover:underline"
          >
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
