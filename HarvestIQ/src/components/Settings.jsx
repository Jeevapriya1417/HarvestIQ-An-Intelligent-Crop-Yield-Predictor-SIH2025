import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Lock, 
  Globe, 
  Bell, 
  Moon, 
  Sun,
  Download,
  Trash2,
  ArrowLeft,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Navbar from './Navbar';
import { Button, Card, Input, Select } from './ui';
import { authAPI } from '../services/api';
import { languages, updateDirection } from '../i18n';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout, updateUser } = useApp();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    location: user?.location || '',
    farmSize: user?.farmSize || '',
    primaryCrop: user?.primaryCrop || ''
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Settings state
  const [settings, setSettings] = useState({
    language: i18n.language || 'en',
    theme: localStorage.getItem('theme') || 'light',
    notifications: {
      email: true,
      push: false,
      predictions: true,
      weather: true
    }
  });

  const languageOptions = Object.entries(languages).map(([code, config]) => ({
    value: code,
    label: `${config.flag} ${config.name}`
  }));

  const cropOptions = [
    { value: 'Wheat', label: 'Wheat (गेहूं)' },
    { value: 'Rice', label: 'Rice (चावल)' },
    { value: 'Sugarcane', label: 'Sugarcane (गन्ना)' },
    { value: 'Cotton', label: 'Cotton (कपास)' },
    { value: 'Maize', label: 'Maize (मक्का)' },
    { value: 'Barley', label: 'Barley (जौ)' },
    { value: 'Other', label: 'Other' }
  ];

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await authAPI.updateProfile(profileData);
      
      if (result.success) {
        updateUser(result.data.user);
        showMessage('success', 'Profile updated successfully');
      } else {
        showMessage('error', result.error);
      }
    } catch (error) {
      showMessage('error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      showMessage('error', 'Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (result.success) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        showMessage('success', 'Password changed successfully');
      } else {
        showMessage('error', result.error);
      }
    } catch (error) {
      showMessage('error', 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language);
    updateDirection(language);
    setSettings(prev => ({ ...prev, language }));
    localStorage.setItem('language', language);
    showMessage('success', 'Language preference saved');
  };

  const handleThemeChange = (theme) => {
    setSettings(prev => ({ ...prev, theme }));
    localStorage.setItem('theme', theme);
    
    // Apply theme (basic implementation)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    showMessage('success', 'Theme preference saved');
  };

  const handleNotificationChange = (type, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value
      }
    }));
    
    localStorage.setItem('notifications', JSON.stringify({
      ...settings.notifications,
      [type]: value
    }));
    
    showMessage('success', 'Notification preferences saved');
  };

  const handleExportData = () => {
    // TODO: Implement data export
    alert('Data export functionality will be implemented in the next phase');
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    const confirmText = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmText !== 'DELETE') {
      return;
    }
    
    // TODO: Implement account deletion
    alert('Account deletion functionality will be implemented in the next phase');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
            
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900">
                Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your account preferences and settings
              </p>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
                  
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Full Name"
                        name="fullName"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                        required
                      />
                      
                      <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                      
                      <Input
                        label="Location"
                        name="location"
                        value={profileData.location}
                        onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="e.g., Punjab, India"
                      />
                      
                      <Input
                        label="Farm Size (hectares)"
                        type="number"
                        step="0.01"
                        name="farmSize"
                        value={profileData.farmSize}
                        onChange={(e) => setProfileData(prev => ({ ...prev, farmSize: e.target.value }))}
                        placeholder="e.g., 5.5"
                      />
                      
                      <Select
                        label="Primary Crop"
                        name="primaryCrop"
                        value={profileData.primaryCrop}
                        onChange={(e) => setProfileData(prev => ({ ...prev, primaryCrop: e.target.value }))}
                        options={cropOptions}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="submit" variant="primary" disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                  
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div className="relative">
                        <Input
                          label="Current Password"
                          type={showPasswords.current ? "text" : "password"}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      
                      <div className="relative">
                        <Input
                          label="New Password"
                          type={showPasswords.new ? "text" : "password"}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      
                      <div className="relative">
                        <Input
                          label="Confirm New Password"
                          type={showPasswords.confirm ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="submit" variant="primary" disabled={loading}>
                        <Lock className="h-4 w-4 mr-2" />
                        {loading ? 'Updating...' : 'Change Password'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h2>
                  
                  <div className="space-y-6">
                    {/* Language */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Language</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                        {languageOptions.map((lang) => (
                          <button
                            key={lang.value}
                            onClick={() => handleLanguageChange(lang.value)}
                            className={`p-3 rounded-lg border text-center transition-colors ${
                              settings.language === lang.value
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <div className="text-sm font-medium">{lang.label}</div>
                            {languages[lang.value]?.dir === 'rtl' && (
                              <div className="text-xs text-gray-500 mt-1">RTL</div>
                            )}
                          </button>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Select your preferred language. Arabic will enable right-to-left text direction.
                      </p>
                    </div>
                    
                    {/* Theme */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button
                          onClick={() => handleThemeChange('light')}
                          className={`p-4 rounded-lg border flex items-center space-x-3 transition-colors ${
                            settings.theme === 'light'
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <Sun className="h-5 w-5" />
                          <span>Light Mode</span>
                        </button>
                        
                        <button
                          onClick={() => handleThemeChange('dark')}
                          className={`p-4 rounded-lg border flex items-center space-x-3 transition-colors ${
                            settings.theme === 'dark'
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <Moon className="h-5 w-5" />
                          <span>Dark Mode</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Settings</h2>
                  
                  <div className="space-y-6">
                    {Object.entries(settings.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900 capitalize">
                            {key === 'email' ? 'Email Notifications' :
                             key === 'push' ? 'Push Notifications' :
                             key === 'predictions' ? 'Prediction Updates' :
                             'Weather Alerts'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {key === 'email' ? 'Receive updates via email' :
                             key === 'push' ? 'Browser push notifications' :
                             key === 'predictions' ? 'Get notified about prediction results' :
                             'Weather warnings and updates'}
                          </p>
                        </div>
                        
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handleNotificationChange(key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Danger Zone */}
            <Card className="p-6 mt-8 border-red-200">
              <h2 className="text-xl font-semibold text-red-900 mb-6">Danger Zone</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <h3 className="font-medium text-red-900">Export Data</h3>
                    <p className="text-sm text-red-700">Download all your data in JSON format</p>
                  </div>
                  <Button variant="outline" onClick={handleExportData} className="text-red-600 border-red-300 hover:bg-red-50">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <h3 className="font-medium text-red-900">Delete Account</h3>
                    <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="outline" onClick={handleDeleteAccount} className="text-red-600 border-red-300 hover:bg-red-50">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;