import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loader from './components/Loader';
import FloatingAssistant from './components/FloatingAssistant';
import { FiGrid, FiFileText, FiMic, FiAlertCircle, FiUser } from 'react-icons/fi';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Documents from './pages/Documents';
import Complaint from './pages/Complaint';
import Schemes from './pages/Schemes';
import Profile from './pages/Profile';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${location.pathname.substring(1)}`} replace />;
  }

  return children;
};

// Mobile Bottom Navigation Bar
const MobileBottomBar = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || ['/login', '/register'].includes(location.pathname)) return null;

  const links = [
    { to: '/dashboard', label: 'Home', icon: <FiGrid className="w-5 h-5" /> },
    { to: '/documents', label: 'Docs', icon: <FiFileText className="w-5 h-5" /> },
    { to: '/chat', label: 'Speak', icon: <FiMic className="w-5 h-5 text-white" />, special: true },
    { to: '/complaint', label: 'Reports', icon: <FiAlertCircle className="w-5 h-5" /> },
    { to: '/profile', label: 'Profile', icon: <FiUser className="w-5 h-5" /> },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/50 py-2 px-4 shadow-xl flex items-center justify-around h-16 animate-slide-up">
      {links.map((link) => {
        const isActive = location.pathname === link.to;
        if (link.special) {
          return (
            <Link
              key={link.to}
              to={link.to}
              className="relative -top-4 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95 transition-all"
            >
              {link.icon}
            </Link>
          );
        }
        return (
          <Link
            key={link.to}
            to={link.to}
            className={`flex flex-col items-center gap-0.5 text-center transition-all ${
              isActive
                ? 'text-primary font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {link.icon}
            <span className="text-[10px] font-semibold">{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

// Layout Wrapper
const AppLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-mesh text-slate-800 transition-colors duration-300 relative overflow-x-hidden">
      {/* Background Blobs */}
      <div className="blob-orange"></div>
      <div className="blob-green"></div>

      <Navbar />
      
      {user && !isAuthPage && location.pathname !== '/' ? (
        <div className="flex flex-1 max-w-6xl w-full mx-auto relative z-10">
          <main className={`flex-1 px-4 sm:px-6 lg:px-8 overflow-x-hidden ${
            location.pathname === '/chat' ? 'pt-2 pb-24 lg:pb-2' : 'py-8 pb-24 lg:pb-8'
          }`}>
            <Routes>
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
              <Route path="/complaint" element={<ProtectedRoute><Complaint /></ProtectedRoute>} />
              <Route path="/schemes" element={<ProtectedRoute><Schemes /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      )}

      {/* Floating global assistant */}
      {location.pathname !== '/chat' && <FloatingAssistant />}

      {/* Mobile Sticky Bottom Bar */}
      <MobileBottomBar />

      {/* Hide footer on chat page to prevent vertical scrolling page jumps */}
      {location.pathname !== '/chat' && <Footer />}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <AppLayout />
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
