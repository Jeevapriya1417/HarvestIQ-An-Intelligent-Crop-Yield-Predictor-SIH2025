import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, checkServerHealth } from '../services/api';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [serverStatus, setServerStatus] = useState('unknown');

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('harvestiq_user');
    const savedLanguage = localStorage.getItem('harvestiq_language');
    const savedTheme = localStorage.getItem('harvestiq_theme');
    const savedToken = localStorage.getItem('harvestiq_token');
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }

    // Check server health on app start
    checkServerConnection();
  }, []);

  // Check server connection
  const checkServerConnection = async () => {
    try {
      const result = await checkServerHealth();
      setServerStatus(result.success ? 'connected' : 'disconnected');
    } catch (error) {
      setServerStatus('disconnected');
    }
  };

  // Authentication functions
  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const result = await authAPI.login(credentials);
      
      if (result.success) {
        setUser(result.data.user);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please check your connection.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const result = await authAPI.register(userData);
      
      if (result.success) {
        setUser(result.data.user);
        return { success: true };
      } else {
        return { success: false, error: result.error, errors: result.errors };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please check your connection.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authAPI.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear user even if API call fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    setIsLoading(true);
    try {
      const result = await authAPI.updateProfile(profileData);
      
      if (result.success) {
        setUser(result.data.user);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please check your connection.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    setIsLoading(true);
    try {
      const result = await authAPI.changePassword(passwordData);
      return result;
    } catch (error) {
      return { success: false, error: 'Network error. Please check your connection.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Prediction functions
  const addPrediction = (prediction) => {
    const newPrediction = {
      ...prediction,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      status: 'completed'
    };
    setPredictions(prev => [newPrediction, ...prev]);
    return newPrediction;
  };

  // Theme and language functions
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('harvestiq_theme', newMode ? 'dark' : 'light');
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('harvestiq_language', newLanguage);
  };

  const value = {
    // State
    user,
    isLoading,
    predictions,
    darkMode,
    language,
    serverStatus,
    
    // Authentication
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    
    // Predictions
    addPrediction,
    
    // Settings
    toggleDarkMode,
    changeLanguage,
    
    // Utils
    setIsLoading,
    checkServerConnection
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};