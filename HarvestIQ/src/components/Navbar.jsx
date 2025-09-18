import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Leaf, 
  Menu, 
  X, 
  Home, 
  BarChart3, 
  TrendingUp, 
  Settings, 
  LogOut,
  Globe,
  User,
  ChevronDown,
  Moon,
  Sun
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { languages, updateDirection } from '../i18n';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, language, changeLanguage, darkMode, toggleDarkMode } = useApp();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const navigationItems = [
    {
      name: t('navigation.home'),
      href: '/dashboard',
      icon: Home
    },
    {
      name: t('navigation.predictions'),
      href: '/prediction',
      icon: TrendingUp
    },
    {
      name: t('navigation.analytics'),
      href: '/analytics',
      icon: BarChart3
    }
  ];

  const languages_array = Object.entries(languages).map(([code, config]) => ({
    code,
    name: config.name,
    flag: config.flag
  }));

  // Group languages for better organization
  const languageGroups = {
    primary: languages_array.filter(lang => ['en', 'hi', 'pa'].includes(lang.code)),
    european: languages_array.filter(lang => ['fr', 'es', 'de'].includes(lang.code)),
    indian: languages_array.filter(lang => ['bn', 'ta', 'te'].includes(lang.code)),
    other: languages_array.filter(lang => ['ar'].includes(lang.code))
  };

  const handleNavigation = (href) => {
    navigate(href);
    setIsMobileMenuOpen(false);
  };

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    i18n.changeLanguage(langCode);
    updateDirection(langCode);
    setIsLanguageDropdownOpen(false);
  };

  // Apply direction on component mount and language change
  useEffect(() => {
    updateDirection(language);
  }, [language]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (href) => {
    return location.pathname === href;
  };

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-green-100 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-gray-900 dark:text-white">HarvestIQ</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {languages_array.find(lang => lang.code === language)?.flag}
                </span>
                <ChevronDown className="h-3 w-3" />
              </button>
              
              {isLanguageDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 max-h-80 overflow-y-auto">
                  {/* Primary Languages */}
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">Primary</div>
                  {languageGroups.primary.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center ${
                        language === lang.code ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="mr-3">{lang.flag}</span>
                      <span className="flex-1">{lang.name}</span>
                      {language === lang.code && <span className="text-green-600 text-xs">✓</span>}
                    </button>
                  ))}
                  
                  {/* European Languages */}
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">European</div>
                  {languageGroups.european.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center ${
                        language === lang.code ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="mr-3">{lang.flag}</span>
                      <span className="flex-1">{lang.name}</span>
                      {language === lang.code && <span className="text-green-600 text-xs">✓</span>}
                    </button>
                  ))}
                  
                  {/* Indian Languages */}
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">Indian Languages</div>
                  {languageGroups.indian.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center ${
                        language === lang.code ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="mr-3">{lang.flag}</span>
                      <span className="flex-1">{lang.name}</span>
                      {language === lang.code && <span className="text-green-600 text-xs">✓</span>}
                    </button>
                  ))}
                  
                  {/* Other Languages */}
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">Other</div>
                  {languageGroups.other.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center ${
                        language === lang.code ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="mr-3">{lang.flag}</span>
                      <span className="flex-1">{lang.name}</span>
                      {language === lang.code && <span className="text-green-600 text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium">{user?.name}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center space-x-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>{t('navigation.settings')}</span>
                  </button>
                  <hr className="my-1 border-gray-200 dark:border-gray-600" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('navigation.logout')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavigation(item.href)}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
              {/* Mobile Theme Toggle */}
              <div className="mb-4">
                <button
                  onClick={toggleDarkMode}
                  className="w-full flex items-center space-x-3 px-3 py-3 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  <span className="font-medium">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>
              
              {/* Mobile Language Selector */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</p>
                <div className="grid grid-cols-2 gap-2">
                  {languages_array.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`p-2 rounded-lg text-sm transition-colors ${
                        language === lang.code
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg mb-1">{lang.flag}</div>
                        <div className="text-xs truncate">{lang.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Mobile User Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    navigate('/settings');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-3 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                >
                  <Settings className="h-5 w-5" />
                  <span className="font-medium">{t('navigation.settings')}</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">{t('navigation.logout')}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Overlay for dropdown menus */}
      {(isLanguageDropdownOpen || isUserDropdownOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsLanguageDropdownOpen(false);
            setIsUserDropdownOpen(false);
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;