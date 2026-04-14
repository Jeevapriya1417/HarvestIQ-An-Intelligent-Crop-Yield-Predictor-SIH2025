import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, checkServerHealth } from '../services/api';

// Debug function to check localStorage values
const debugStorage = () => {
  console.log('Current localStorage values:');
  console.log('harvestiq_user:', localStorage.getItem('harvestiq_user'));
  console.log('harvestiq_token:', localStorage.getItem('harvestiq_token'));
  console.log('harvestiq_theme:', localStorage.getItem('harvestiq_theme'));
  console.log('harvestiq_language:', localStorage.getItem('harvestiq_language'));
};

const AppContext = createContext();

/**
 * Normalize user object to ensure 'name' property exists
 * Backend uses 'fullName', frontend expects 'name'
 */
const normalizeUser = (user) => {
  if (!user) return user;
  
  // If user already has 'name', return as-is
  if (user.name) return user;
  
  // Map fullName to name (backend uses fullName)
  if (user.fullName) {
    return { ...user, name: user.fullName };
  }
  
  // Fallback to username if available
  if (user.username) {
    return { ...user, name: user.username };
  }
  
  // If no name property found, return user as-is (will log warning later)
  return user;
};

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
    debugStorage();
    
    const savedUser = localStorage.getItem('harvestiq_user');
    const savedLanguage = localStorage.getItem('harvestiq_language');
    const savedTheme = localStorage.getItem('harvestiq_theme');
    const savedToken = localStorage.getItem('harvestiq_token');
    
    console.log('Loading user from localStorage:', {
      hasUser: !!savedUser,
      hasToken: !!savedToken,
      rawUser: savedUser
    });

    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('Parsed user data:', parsedUser);
        
        // Normalize user object to ensure 'name' property exists
        const normalizedUser = normalizeUser(parsedUser);
        setUser(normalizedUser);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
    if (savedTheme) {
      const isDark = savedTheme === 'dark';
      setDarkMode(isDark);
      // Apply theme to document
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
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
      
      console.log('Login API response:', {
        success: result.success,
        data: result.data,
        error: result.error
      });

      if (result.success) {
        console.log('Setting user from login response:', result.data.user);
        // Normalize user object to ensure 'name' property exists
        const normalizedUser = normalizeUser(result.data.user);
        setUser(normalizedUser);
        return { success: true };
      } else {
        console.error('Login failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login network error:', error);
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
        // Normalize user object to ensure 'name' property exists
        const normalizedUser = normalizeUser(result.data.user);
        setUser(normalizedUser);
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
    
    // Apply theme to document
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('harvestiq_language', newLanguage);
  };

  // Add effect to watch user changes and save to localStorage
  useEffect(() => {
    if (user) {
      // Ensure user has name property
      if (user.name) {
        console.log('User state changed, saving to localStorage:', user);
        localStorage.setItem('harvestiq_user', JSON.stringify(user));
      } else if (user.fullName) {
        // Backend uses fullName, map it to name for frontend compatibility
        const userWithName = { ...user, name: user.fullName };
        console.log('User state changed (using fullName), saving to localStorage:', userWithName);
        localStorage.setItem('harvestiq_user', JSON.stringify(userWithName));
      } else if (user.username) {
        // Try to use username as fallback
        const userWithName = { ...user, name: user.username };
        console.log('User state changed (using username), saving to localStorage:', userWithName);
        localStorage.setItem('harvestiq_user', JSON.stringify(userWithName));
      } else {
        console.warn('User object has no name, fullName, or username property:', user);
      }
    } else {
      console.log('User state cleared, removing from localStorage');
      localStorage.removeItem('harvestiq_user');
    }
  }, [user]);

  // Create a validated user object
  const validatedUser = user ? {
    id: user.id || null,
    fullName: user.fullName || user.name || user.username || 'User',
    firstName: (user.fullName || user.name || user.username || 'User').split(' ')[0],
    email: user.email || '',
    role: user.role || 'user',
    avatar: user.avatar || null,
    preferences: user.preferences || {
      language: 'en',
      theme: 'light',
      notifications: {
        email: true,
        weather: true,
        market: true
      }
    },
    // Add other properties with defaults as needed
  } : null;

  const value = {
    // State
    user: validatedUser,
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