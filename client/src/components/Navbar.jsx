import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';
import { FiLogOut, FiMenu, FiX, FiInfo, FiAward } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 12) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const allNavLinks = [
    { path: user ? '/dashboard' : '/', label: t.navHome },
    { path: '/chat', label: t.navChat, requiresAuth: true },
    { path: '/documents', label: t.navDocuments, requiresAuth: true },
    { path: '/complaint', label: t.navComplaints, requiresAuth: true },
    { path: '/schemes', label: t.navSchemes, requiresAuth: true },
    { path: '/profile', label: t.navProfile, requiresAuth: true },
    { path: '#about', label: t.navAbout || 'About', onClick: (e) => { e.preventDefault(); setShowAbout(true); } }
  ];

  const handleNavClick = (e, link) => {
    if (link.onClick) { link.onClick(e); return; }
    if (link.requiresAuth && !user) {
      e.preventDefault();
      navigate('/login');
      setIsOpen(false);
    }
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-md shadow-md border-b border-slate-200/50'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/" className="flex items-center gap-2">
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-emerald-600 text-white font-display font-extrabold text-lg shadow-md shadow-primary/20">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2a2 2 0 0 1 2 2c0 .3-.07.59-.2.85A6 6 0 0 1 20 11v1a3 3 0 0 1-3 3h-1v2h2a2 2 0 0 1 2 2v1h-2v-1h-2v2h-2v-2H10v2H8v-2H6v1H4v-1c0-1.1.9-2 2-2h2v-2H7a3 3 0 0 1-3-3v-1a6 6 0 0 1 6.2-6.15C10.07 4.59 10 4.3 10 4a2 2 0 0 1 2-2zm0 5a4 4 0 0 0-4 4v1h8v-1a4 4 0 0 0-4-4zm-2.5 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/>
                  </svg>
                </span>
                <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {t.title}
                </span>
              </Link>
            </div>

            {/* Center: Navigation Links */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-1.5 flex-1 justify-center px-2 sm:px-4">
              {allNavLinks.map((link) => {
                const isActive = location.pathname === link.path;
                const locked = link.requiresAuth && !user;
                return (
                  <Link
                    key={link.path}
                    to={link.onClick ? '#' : (locked ? '#' : link.path)}
                    onClick={(e) => handleNavClick(e, link)}
                    className={`px-3 py-2 text-xs xl:text-sm font-bold transition-all relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:w-2/3 after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100 whitespace-nowrap ${
                      isActive
                        ? 'text-primary bg-primary-light/50 rounded-xl'
                        : locked
                        ? 'text-slate-400 hover:text-primary cursor-pointer'
                        : 'text-slate-600 hover:text-primary'
                    }`}
                    title={locked ? 'Sign in to access' : undefined}
                  >
                    {link.label}
                    {locked && <span className="ml-1 text-[9px] align-super opacity-60">🔒</span>}
                  </Link>
                );
              })}
            </div>

            {/* Right: Accessibility Controls & Auth */}
            <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
              {/* Language dropdown */}
              <LanguageSelector />

              {/* Auth */}
              {user ? (
                <div className="flex items-center gap-3 ml-1 pl-3 border-l border-slate-200">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {user.name[0].toUpperCase()}
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <FiLogOut className="w-4.5 h-4.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 ml-1 pl-3 border-l border-slate-200">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-750 hover:bg-slate-50"
                  >
                    {t.login}
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-emerald-700 shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer"
                  >
                    {t.register}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu trigger */}
            <div className="flex items-center lg:hidden gap-1">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl text-slate-600"
              >
                {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/50 py-4 px-6 space-y-3 shadow-2xl">
            {allNavLinks.map((link) => {
              const locked = link.requiresAuth && !user;
              return (
                <Link
                  key={link.path}
                  to={link.onClick ? '#' : (locked ? '#' : link.path)}
                  onClick={(e) => { handleNavClick(e, link); setIsOpen(false); }}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-base font-bold ${
                    location.pathname === link.path
                      ? 'text-primary bg-primary-light'
                      : locked
                      ? 'text-slate-400'
                      : 'text-slate-700 hover:text-primary'
                  }`}
                >
                  {link.label}
                  {locked && <span className="ml-auto text-xs opacity-50">🔒</span>}
                </Link>
              );
            })}

            <div className="pt-4 border-t border-slate-200/50 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Language</span>
                <LanguageSelector />
              </div>

              {user ? (
                <div className="space-y-3 pt-2">
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {user.name[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-bold">{user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-danger/30 text-danger font-bold text-sm"
                  >
                    <FiLogOut className="w-4 h-4" />
                    <span>{t.logout}</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold"
                  >
                    {t.login}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl bg-primary text-white font-bold"
                  >
                    {t.register}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl relative animate-scale-up space-y-4">
            <button
              onClick={() => setShowAbout(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 text-primary">
              <span className="w-10 h-10 rounded-2xl bg-primary-light flex items-center justify-center text-xl">
                <FiInfo />
              </span>
              <h3 className="font-display font-extrabold text-xl">{t.aboutTitle || "About Seva Setu AI"}</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>Seva Setu AI</strong> {t.aboutDescription || "is an intelligent, citizen-first civic assistance platform built to simplify Indian public services. Speak naturally in English, Hindi, or Marathi to query welfare schemes, discover required application documents, and draft civic complaints instantly."}
            </p>
            <div className="p-4 bg-primary-light/40 rounded-2xl border border-primary/10 text-xs text-primary font-semibold flex items-center gap-2">
              <FiAward className="w-4.5 h-4.5 shrink-0" />
              <span>{t.aboutFoot || "Dedicated to accelerating Digital India inclusion."}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
