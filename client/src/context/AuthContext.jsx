import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [recentSavedSchemes, setRecentSavedSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize Auth from localStorage token
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('seva_setu_token');
      if (token) {
        try {
          await fetchProfile();
        } catch (error) {
          console.error('Session restoration failed:', error.message);
          logout();
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      setUser(response.data.user);
      setStats(response.data.stats);
      setRecentComplaints(response.data.recentComplaints || []);
      setRecentSavedSchemes(response.data.recentSavedSchemes || []);
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('seva_setu_token', response.data.token);
      setUser({
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        preferredLanguage: response.data.preferredLanguage
      });
      await fetchProfile();
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (name, email, password, preferredLanguage) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', { name, email, password, preferredLanguage });
      localStorage.setItem('seva_setu_token', response.data.token);
      setUser({
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        preferredLanguage: response.data.preferredLanguage
      });
      await fetchProfile();
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/profile', profileData);
      setUser(response.data);
      // Refresh profile to update statistics/recents
      await fetchProfile();
      return response.data;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('seva_setu_token');
    setUser(null);
    setStats(null);
    setRecentComplaints([]);
    setRecentSavedSchemes([]);
  };

  return (
    <AuthContext.Provider value={{
      user,
      stats,
      recentComplaints,
      recentSavedSchemes,
      loading,
      login,
      register,
      logout,
      updateProfile,
      fetchProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
