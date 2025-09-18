import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Leaf, ArrowLeft, Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, register, isLoading } = useApp();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [errors, setErrors] = useState({});

  // Password strength validation
  const getPasswordStrength = (password) => {
    const requirements = {
      minLength: password.length >= 6,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const score = Object.values(requirements).filter(Boolean).length;
    
    return {
      requirements,
      score,
      strength: score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong'
    };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    }else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
  newErrors.email = 'Email is invalid';
}
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!passwordStrength.requirements.hasLowercase) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!passwordStrength.requirements.hasUppercase) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!passwordStrength.requirements.hasNumber) {
      newErrors.password = 'Password must contain at least one number';
    }
    
    // Registration specific validations
    if (!isLogin) {
      if (!formData.fullName) {
        newErrors.fullName = 'Full name is required';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      let result;
      if (isLogin) {
        result = await login({
          email: formData.email,
          password: formData.password
        });
      } else {
        result = await register({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password
        });
      }
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrors({ general: result.error || 'An error occurred' });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: ''
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-green-200/30 dark:bg-green-800/20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-green-300/20 dark:bg-green-900/20"></div>
      </div>
      
      <div className="relative w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </button>
        
        {/* Auth Card */}
        <div className="glass rounded-2xl p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-display font-bold text-gray-900 dark:text-white">HarvestIQ</span>
            </div>
            
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
              {isLogin ? t('auth.loginTitle') : t('auth.registerTitle')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {isLogin ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.fullName')}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.password ? 'border-red-500' : 
                    formData.password && passwordStrength.score >= 4 ? 'border-green-500' :
                    formData.password && passwordStrength.score >= 2 ? 'border-yellow-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Password Requirements (Show during registration or when password has focus) */}
              {(!isLogin || formData.password) && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password Requirements:</div>
                  <div className="space-y-1">
                    <div className={`flex items-center text-xs ${
                      passwordStrength.requirements.minLength ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {passwordStrength.requirements.minLength ? 
                        <Check className="h-3 w-3 mr-2" /> : 
                        <X className="h-3 w-3 mr-2" />
                      }
                      At least 6 characters
                    </div>
                    <div className={`flex items-center text-xs ${
                      passwordStrength.requirements.hasLowercase ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {passwordStrength.requirements.hasLowercase ? 
                        <Check className="h-3 w-3 mr-2" /> : 
                        <X className="h-3 w-3 mr-2" />
                      }
                      One lowercase letter (a-z)
                    </div>
                    <div className={`flex items-center text-xs ${
                      passwordStrength.requirements.hasUppercase ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {passwordStrength.requirements.hasUppercase ? 
                        <Check className="h-3 w-3 mr-2" /> : 
                        <X className="h-3 w-3 mr-2" />
                      }
                      One uppercase letter (A-Z)
                    </div>
                    <div className={`flex items-center text-xs ${
                      passwordStrength.requirements.hasNumber ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {passwordStrength.requirements.hasNumber ? 
                        <Check className="h-3 w-3 mr-2" /> : 
                        <X className="h-3 w-3 mr-2" />
                      }
                      One number (0-9)
                    </div>
                    <div className={`flex items-center text-xs ${
                      passwordStrength.requirements.hasSpecialChar ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {passwordStrength.requirements.hasSpecialChar ? 
                        <Check className="h-3 w-3 mr-2" /> : 
                        <X className="h-3 w-3 mr-2" />
                      }
                      One special character (!@#$%^&*)
                    </div>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Strength:</span>
                        <span className={`text-xs font-medium ${
                          passwordStrength.strength === 'strong' ? 'text-green-600 dark:text-green-400' :
                          passwordStrength.strength === 'medium' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.strength === 'strong' ? 'bg-green-500 dark:bg-green-400' :
                            passwordStrength.strength === 'medium' ? 'bg-yellow-500 dark:bg-yellow-400' : 'bg-red-500 dark:bg-red-400'
                          }`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.confirmPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.confirmPassword ? 'border-red-500' :
                      formData.confirmPassword && formData.password === formData.confirmPassword ? 'border-green-500' :
                      formData.confirmPassword ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <div className={`mt-2 flex items-center text-sm ${
                    formData.password === formData.confirmPassword ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formData.password === formData.confirmPassword ? 
                      <Check className="h-4 w-4 mr-2" /> : 
                      <X className="h-4 w-4 mr-2" />
                    }
                    {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                  </div>
                )}
                
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                {errors.general}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-primary text-white py-3 rounded-lg hover:shadow-lg transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {t('common.loading')}
                </div>
              ) : (
                isLogin ? t('auth.login') : t('auth.register')
              )}
            </button>

            {/* Forgot Password (Login only) */}
            {isLogin && (
              <div className="text-center">
                <button
                  type="button"
                  className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm transition-colors"
                >
                  {t('auth.forgotPassword')}
                </button>
              </div>
            )}
          </form>

          {/* Toggle Auth Mode */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
              <button
                onClick={toggleAuthMode}
                className="ml-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-semibold transition-colors"
              >
                {isLogin ? t('auth.register') : t('auth.login')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;