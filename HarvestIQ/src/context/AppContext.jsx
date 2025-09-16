import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('harvestiq_user');
    const savedLanguage = localStorage.getItem('harvestiq_language');
    const savedTheme = localStorage.getItem('harvestiq_theme');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Authentication functions
  const login = async (credentials) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: 1,
        name: credentials.email.split('@')[0],
        email: credentials.email,
        avatar: null
      };
      
      setUser(mockUser);
      localStorage.setItem('harvestiq_user', JSON.stringify(mockUser));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: Date.now(),
        name: userData.fullName,
        email: userData.email,
        avatar: null
      };
      
      setUser(mockUser);
      localStorage.setItem('harvestiq_user', JSON.stringify(mockUser));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('harvestiq_user');
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
    
    // Authentication
    login,
    register,
    logout,
    
    // Predictions
    addPrediction,
    
    // Settings
    toggleDarkMode,
    changeLanguage,
    
    // Utils
    setIsLoading
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};