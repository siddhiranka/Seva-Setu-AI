import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  FiMessageSquare,
  FiFileText,
  FiAlertCircle,
  FiAward,
  FiUser,
  FiSettings,
  FiGrid
} from 'react-icons/fi';

const Sidebar = () => {
  const { t } = useLanguage();

  const links = [
    { to: '/dashboard', label: t.navDashboard, icon: <FiGrid className="w-5 h-5" /> },
    { to: '/chat', label: t.navChat, icon: <FiMessageSquare className="w-5 h-5" /> },
    { to: '/documents', label: t.navDocuments, icon: <FiFileText className="w-5 h-5" /> },
    { to: '/complaint', label: t.navComplaints, icon: <FiAlertCircle className="w-5 h-5" /> },
    { to: '/schemes', label: t.navSchemes, icon: <FiAward className="w-5 h-5" /> },
    { to: '/profile', label: t.navProfile, icon: <FiUser className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800/50 min-h-[calc(100vh-4rem)] hidden md:block transition-all duration-300">
      <div className="p-6 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/10 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
