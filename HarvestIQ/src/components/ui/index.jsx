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
  hint, 
  required = false,
  className = '',
  ...props 
}) => {
  const inputClasses = `w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
    error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
  } ${className}`;
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input className={inputClasses} {...props} />
      {hint && !error && (
        <p className="text-sm text-gray-500">{hint}</p>
      )}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Enhanced Select Component
export const Select = ({ 
  label, 
  error, 
  options = [], 
  placeholder = 'Select an option',
  required = false,
  className = '',
  ...props 
}) => {
  const selectClasses = `w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
    error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
  } ${className}`;
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select className={selectClasses} {...props}>
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
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
    gray: 'border-gray-600'
  };
  
  return (
    <div className={`animate-spin rounded-full border-2 border-t-transparent ${sizes[size]} ${colors[color]} ${className}`}></div>
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