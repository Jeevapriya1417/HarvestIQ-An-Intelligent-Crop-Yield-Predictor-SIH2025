// Enhanced UI Components Library
import React from 'react';
import { Loader2 } from 'lucide-react';

// Enhanced Button Component
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  disabled = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-gradient-primary text-white hover:shadow-lg focus:ring-green-500',
    secondary: 'bg-white text-green-700 border-2 border-green-200 hover:bg-green-50 focus:ring-green-500',
    outline: 'border-2 border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500',
    ghost: 'text-green-600 hover:bg-green-50 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <button 
      className={classes} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
      {children}
    </button>
  );
};

// Enhanced Input Component
export const Input = ({ 
  label, 
  error, 
  warning,
  hint, 
  required = false,
  isValidating = false,
  showValidIcon = true,
  className = '',
  onBlur,
  ...props 
}) => {
  const hasError = error && error.trim() !== '';
  const hasWarning = warning && warning.trim() !== '';
  const isValid = !hasError && !isValidating && props.value && props.value.trim() !== '';
  
  const inputClasses = `w-full px-4 py-3 pr-10 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
    hasError 
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
      : hasWarning
      ? 'border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500'
      : isValid && showValidIcon
      ? 'border-green-500'
      : 'border-gray-300'
  } ${className}`;
  
  const handleBlur = (e) => {
    if (onBlur) onBlur(e);
  };
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input 
          className={inputClasses} 
          onBlur={handleBlur}
          {...props} 
        />
        
        {/* Validation Icons */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {isValidating && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent"></div>
          )}
          {!isValidating && hasError && (
            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )}
          {!isValidating && hasWarning && !hasError && (
            <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )}
          {!isValidating && isValid && showValidIcon && !hasError && !hasWarning && (
            <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      
      {/* Error Message */}
      {hasError && (
        <div className="flex items-start space-x-2">
          <svg className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      {/* Warning Message */}
      {hasWarning && !hasError && (
        <div className="flex items-start space-x-2">
          <svg className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm text-yellow-600">{warning}</p>
        </div>
      )}
      
      {/* Hint Message */}
      {hint && !hasError && !hasWarning && (
        <div className="flex items-start space-x-2">
          <svg className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-gray-500">{hint}</p>
        </div>
      )}
    </div>
  );
};

// Enhanced Select Component
export const Select = ({ 
  label, 
  error, 
  warning,
  options = [], 
  placeholder = 'Select an option',
  required = false,
  isValidating = false,
  showValidIcon = true,
  className = '',
  onBlur,
  ...props 
}) => {
  const hasError = error && error.trim() !== '';
  const hasWarning = warning && warning.trim() !== '';
  const isValid = !hasError && !isValidating && props.value && props.value.trim() !== '';
  
  const selectClasses = `w-full px-4 py-3 pr-10 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
    hasError 
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
      : hasWarning
      ? 'border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500'
      : isValid && showValidIcon
      ? 'border-green-500'
      : 'border-gray-300'
  } ${className}`;
  
  const handleBlur = (e) => {
    if (onBlur) onBlur(e);
  };
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select 
          className={selectClasses} 
          onBlur={handleBlur}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option, index) => (
            <option key={index} value={option.value || option}>
              {option.label || option}
            </option>
          ))}
        </select>
        
        {/* Validation Icons */}
        <div className="absolute inset-y-0 right-8 flex items-center pr-3 pointer-events-none">
          {isValidating && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent"></div>
          )}
          {!isValidating && hasError && (
            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )}
          {!isValidating && hasWarning && !hasError && (
            <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )}
          {!isValidating && isValid && showValidIcon && !hasError && !hasWarning && (
            <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      
      {/* Error Message */}
      {hasError && (
        <div className="flex items-start space-x-2">
          <svg className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      {/* Warning Message */}
      {hasWarning && !hasError && (
        <div className="flex items-start space-x-2">
          <svg className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm text-yellow-600">{warning}</p>
        </div>
      )}
    </div>
  );
};

// Card Component
export const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  hover = false 
}) => {
  const baseClasses = 'rounded-xl border transition-all duration-300';
  
  const variants = {
    default: 'bg-white border-gray-200 shadow-sm',
    glass: 'glass bg-white/80 backdrop-blur-sm border-white/20 shadow-xl',
    gradient: 'bg-gradient-to-br from-white to-gray-50 border-gray-100 shadow-lg'
  };
  
  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1' : '';
  
  const classes = `${baseClasses} ${variants[variant]} ${hoverClasses} ${className}`;
  
  return (
    <div className={classes}>
      {children}
    </div>
  );
};

// Badge Component
export const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'sm',
  className = '' 
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };
  
  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <span className={classes}>
      {children}
    </span>
  );
};

// Progress Bar Component
export const ProgressBar = ({ 
  value = 0, 
  max = 100, 
  color = 'green',
  size = 'md',
  showLabel = false,
  className = '' 
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };
  
  const colors = {
    green: 'bg-green-600',
    blue: 'bg-blue-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600'
  };
  
  return (
    <div className={`w-full space-y-1 ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm font-medium text-gray-700">
          <span>Progress</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${sizes[size]}`}>
        <div 
          className={`${colors[color]} ${sizes[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// Loading Spinner Component
export const LoadingSpinner = ({ 
  size = 'md', 
  color = 'green',
  className = '' 
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };
  
  const colors = {
    green: 'border-green-600',
    blue: 'border-blue-600',
    gray: 'border-gray-600',
    white: 'border-white'
  };
  
  return (
    <div className={`animate-spin rounded-full border-2 border-t-transparent ${sizes[size]} ${colors[color]} ${className}`}></div>
  );
};

// Enhanced Skeleton Loader Component
export const Skeleton = ({ className = '', variant = 'default', children }) => {
  const variants = {
    default: 'bg-gray-200 animate-pulse',
    shimmer: 'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%]',
    wave: 'bg-gray-200 animate-pulse relative overflow-hidden'
  };

  if (variant === 'wave') {
    return (
      <div className={`${variants[variant]} ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-slide-in-right opacity-30"></div>
        {children}
      </div>
    );
  }

  return (
    <div className={`${variants[variant]} rounded ${className}`}>
      {children}
    </div>
  );
};

// Page Loading Component
export const PageLoader = ({ message = 'Loading...', showSpinner = true }) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center animate-fade-in-up">
        {showSpinner && (
          <div className="mb-4">
            <LoadingSpinner size="xl" color="green" />
          </div>
        )}
        <p className="text-gray-600 text-lg font-medium">{message}</p>
      </div>
    </div>
  );
};

// Card Skeleton Component
export const CardSkeleton = ({ showImage = false, lines = 3 }) => {
  return (
    <Card className="p-6 animate-fade-in">
      {showImage && (
        <Skeleton className="w-full h-48 mb-4" variant="shimmer" />
      )}
      <div className="space-y-3">
        <Skeleton className="h-6 w-3/4" variant="shimmer" />
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={`h-4 ${i === lines - 1 ? 'w-1/2' : 'w-full'}`} variant="shimmer" />
        ))}
      </div>
    </Card>
  );
};

// Enhanced Toast Notification Component
export const Toast = ({ 
  type = 'info', 
  message, 
  onClose, 
  duration = 5000,
  className = '' 
}) => {
  const types = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 animate-slide-in-right ${className}`}>
      <div className={`flex items-center p-4 border rounded-lg shadow-lg max-w-md ${types[type]}`}>
        <span className="mr-3 text-xl">{icons[type]}</span>
        <p className="flex-1">{message}</p>
        <button
          onClick={onClose}
          className="ml-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Alert Component
export const Alert = ({ 
  children, 
  variant = 'info', 
  dismissible = false,
  onDismiss,
  className = '' 
}) => {
  const variants = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  };
  
  const classes = `relative p-4 border rounded-lg ${variants[variant]} ${className}`;
  
  return (
    <div className={classes}>
      {children}
      {dismissible && (
        <button 
          onClick={onDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      )}
    </div>
  );
};

// Stat Card Component
export const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType = 'neutral',
  className = '' 
}) => {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };
  
  return (
    <Card className={`p-6 ${className}`} hover>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${changeColors[changeType]}`}>
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-green-600" />
          </div>
        )}
      </div>
    </Card>
  );
};