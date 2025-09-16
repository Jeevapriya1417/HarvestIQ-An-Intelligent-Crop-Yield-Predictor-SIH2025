import React, { useState } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, language, changeLanguage } = useApp();
  
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

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' }
  ];

  const handleNavigation = (href) => {
    navigate(href);
    setIsMobileMenuOpen(false);
  };

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    i18n.changeLanguage(langCode);
    setIsLanguageDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (href) => {
    return location.pathname === href;
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-gray-900">HarvestIQ</span>
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
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
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
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {languages.find(lang => lang.code === language)?.flag}
                </span>
                <ChevronDown className="h-3 w-3" />
              </button>
              
              {isLanguageDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-green-50 transition-colors ${
                        language === lang.code ? 'bg-green-50 text-green-700' : 'text-gray-700'
                      }`}
                    >
                      <span className="mr-3">{lang.flag}</span>
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
              >
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm font-medium">{user?.name}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition-colors flex items-center space-x-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>{t('navigation.settings')}</span>
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
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
              className="text-gray-600 hover:text-green-600 transition-colors"
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
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavigation(item.href)}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="border-t border-gray-200 mt-4 pt-4">
              {/* Mobile Language Selector */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Language</p>
                <div className="grid grid-cols-3 gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`p-2 rounded-lg text-sm transition-colors ${
                        language === lang.code
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-green-50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg mb-1">{lang.flag}</div>
                        <div className="text-xs">{lang.name}</div>
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
                  className="w-full flex items-center space-x-3 px-3 py-3 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <Settings className="h-5 w-5" />
                  <span className="font-medium">{t('navigation.settings')}</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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