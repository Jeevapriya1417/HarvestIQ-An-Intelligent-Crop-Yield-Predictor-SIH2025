// Comprehensive validation utilities for HarvestIQ application

export class ValidationError extends Error {
  constructor(field, message, value = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

export class ValidationResult {
  constructor(isValid = true, errors = [], warnings = []) {
    this.isValid = isValid;
    this.errors = errors;
    this.warnings = warnings;
  }

  addError(field, message, value = null) {
    this.errors.push(new ValidationError(field, message, value));
    this.isValid = false;
    return this;
  }

  addWarning(field, message, value = null) {
    this.warnings.push({ field, message, value });
    return this;
  }

  getFieldErrors(field) {
    return this.errors.filter(error => error.field === field);
  }

  getFieldWarnings(field) {
    return this.warnings.filter(warning => warning.field === field);
  }

  getFirstError(field) {
    const fieldErrors = this.getFieldErrors(field);
    return fieldErrors.length > 0 ? fieldErrors[0].message : null;
  }
}

// Base validation rules
export const ValidationRules = {
  // Required field validation
  required: (value, fieldName = 'Field') => {
    if (value === null || value === undefined || value === '' || 
        (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} is required`;
    }
    return null;
  },

  // Email validation
  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  // Password validation
  password: (value) => {
    if (!value) return null;
    
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumbers = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    if (value.length < minLength) {
      return `Password must be at least ${minLength} characters long`;
    }
    if (!hasUpperCase) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!hasLowerCase) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!hasNumbers) {
      return 'Password must contain at least one number';
    }
    // Optional: special character requirement
    // if (!hasSpecialChar) {
    //   return 'Password must contain at least one special character';
    // }
    
    return null;
  },

  // Name validation
  name: (value) => {
    if (!value) return null;
    if (value.length < 2) {
      return 'Name must be at least 2 characters long';
    }
    if (value.length > 100) {
      return 'Name must not exceed 100 characters';
    }
    if (!/^[a-zA-Z\s'-]+$/.test(value)) {
      return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }
    return null;
  },

  // Number validation
  number: (value, min = null, max = null, fieldName = 'Number') => {
    if (!value && value !== 0) return null;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return `${fieldName} must be a valid number`;
    }
    if (min !== null && numValue < min) {
      return `${fieldName} must be at least ${min}`;
    }
    if (max !== null && numValue > max) {
      return `${fieldName} must not exceed ${max}`;
    }
    return null;
  },

  // Positive number validation
  positiveNumber: (value, fieldName = 'Number') => {
    if (!value && value !== 0) return null;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return `${fieldName} must be a valid number`;
    }
    if (numValue <= 0) {
      return `${fieldName} must be greater than 0`;
    }
    return null;
  },

  // Coordinate validation
  latitude: (value) => {
    if (!value && value !== 0) return null;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return 'Latitude must be a valid number';
    }
    if (numValue < -90 || numValue > 90) {
      return 'Latitude must be between -90 and 90 degrees';
    }
    return null;
  },

  longitude: (value) => {
    if (!value && value !== 0) return null;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return 'Longitude must be a valid number';
    }
    if (numValue < -180 || numValue > 180) {
      return 'Longitude must be between -180 and 180 degrees';
    }
    return null;
  },

  // pH level validation
  phLevel: (value) => {
    if (!value && value !== 0) return null;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return 'pH level must be a valid number';
    }
    if (numValue < 0 || numValue > 14) {
      return 'pH level must be between 0 and 14';
    }
    return null;
  },

  // Percentage validation
  percentage: (value, fieldName = 'Percentage') => {
    if (!value && value !== 0) return null;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return `${fieldName} must be a valid number`;
    }
    if (numValue < 0 || numValue > 100) {
      return `${fieldName} must be between 0 and 100`;
    }
    return null;
  },

  // URL validation
  url: (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  },

  // Date validation
  date: (value, futureOnly = false, pastOnly = false) => {
    if (!value) return null;
    
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return 'Please enter a valid date';
    }
    
    const now = new Date();
    if (futureOnly && date <= now) {
      return 'Date must be in the future';
    }
    if (pastOnly && date >= now) {
      return 'Date must be in the past';
    }
    
    return null;
  },

  // Custom validation for specific fields
  cropType: (value) => {
    if (!value) return null;
    const validCrops = ['Wheat', 'Rice', 'Sugarcane', 'Cotton', 'Maize', 'Barley', 'Mustard', 'Potato', 'Onion', 'Tomato'];
    if (!validCrops.includes(value)) {
      return 'Please select a valid crop type';
    }
    return null;
  },

  soilType: (value) => {
    if (!value) return null;
    const validSoilTypes = ['loamy', 'clay', 'sandy', 'silt', 'peaty', 'chalky'];
    if (!validSoilTypes.includes(value)) {
      return 'Please select a valid soil type';
    }
    return null;
  }
};

// Composite validators for complex forms
export const FormValidators = {
  // User registration validation
  userRegistration: (data) => {
    const result = new ValidationResult();
    
    // Validate full name
    const nameError = ValidationRules.required(data.fullName, 'Full name') || 
                     ValidationRules.name(data.fullName);
    if (nameError) result.addError('fullName', nameError, data.fullName);
    
    // Validate email
    const emailError = ValidationRules.required(data.email, 'Email') || 
                      ValidationRules.email(data.email);
    if (emailError) result.addError('email', emailError, data.email);
    
    // Validate password
    const passwordError = ValidationRules.required(data.password, 'Password') || 
                         ValidationRules.password(data.password);
    if (passwordError) result.addError('password', passwordError);
    
    // Validate password confirmation
    if (data.password !== data.confirmPassword) {
      result.addError('confirmPassword', 'Passwords do not match');
    }
    
    return result;
  },

  // User login validation
  userLogin: (data) => {
    const result = new ValidationResult();
    
    const emailError = ValidationRules.required(data.email, 'Email') || 
                      ValidationRules.email(data.email);
    if (emailError) result.addError('email', emailError, data.email);
    
    const passwordError = ValidationRules.required(data.password, 'Password');
    if (passwordError) result.addError('password', passwordError);
    
    return result;
  },

  // Field validation
  field: (data) => {
    const result = new ValidationResult();
    
    // Validate name
    const nameError = ValidationRules.required(data.name, 'Field name');
    if (nameError) result.addError('name', nameError, data.name);
    
    // Validate size
    const sizeError = ValidationRules.required(data.size, 'Field size') || 
                     ValidationRules.positiveNumber(data.size, 'Field size');
    if (sizeError) result.addError('size', sizeError, data.size);
    
    // Validate coordinates if provided
    if (data.coordinates) {
      const latError = ValidationRules.latitude(data.coordinates.latitude);
      if (latError) result.addError('coordinates.latitude', latError, data.coordinates.latitude);
      
      const lngError = ValidationRules.longitude(data.coordinates.longitude);
      if (lngError) result.addError('coordinates.longitude', lngError, data.coordinates.longitude);
    }
    
    // Validate soil type if provided
    if (data.soilType) {
      const soilError = ValidationRules.soilType(data.soilType);
      if (soilError) result.addError('soilType', soilError, data.soilType);
    }
    
    return result;
  },

  // Prediction validation
  prediction: (data) => {
    const result = new ValidationResult();
    
    // Validate crop type
    const cropError = ValidationRules.required(data.cropType, 'Crop type') || 
                     ValidationRules.cropType(data.cropType);
    if (cropError) result.addError('cropType', cropError, data.cropType);
    
    // Validate farm area
    const areaError = ValidationRules.required(data.farmArea, 'Farm area') || 
                     ValidationRules.positiveNumber(data.farmArea, 'Farm area');
    if (areaError) result.addError('farmArea', areaError, data.farmArea);
    
    // Validate region
    const regionError = ValidationRules.required(data.region, 'Region');
    if (regionError) result.addError('region', regionError, data.region);
    
    // Validate pH level if provided
    if (data.phLevel) {
      const phError = ValidationRules.phLevel(data.phLevel);
      if (phError) result.addError('phLevel', phError, data.phLevel);
    }
    
    // Validate organic content if provided
    if (data.organicContent) {
      const organicError = ValidationRules.percentage(data.organicContent, 'Organic content');
      if (organicError) result.addError('organicContent', organicError, data.organicContent);
    }
    
    // Validate nutrients if provided
    ['nitrogen', 'phosphorus', 'potassium'].forEach(nutrient => {
      if (data[nutrient]) {
        const nutrientError = ValidationRules.positiveNumber(data[nutrient], `${nutrient} level`);
        if (nutrientError) result.addError(nutrient, nutrientError, data[nutrient]);
      }
    });
    
    // Validate weather data if provided
    if (data.temperature) {
      const tempError = ValidationRules.number(data.temperature, -50, 60, 'Temperature');
      if (tempError) result.addError('temperature', tempError, data.temperature);
    }
    
    if (data.rainfall) {
      const rainError = ValidationRules.number(data.rainfall, 0, 10000, 'Rainfall');
      if (rainError) result.addError('rainfall', rainError, data.rainfall);
    }
    
    if (data.humidity) {
      const humidityError = ValidationRules.percentage(data.humidity, 'Humidity');
      if (humidityError) result.addError('humidity', humidityError, data.humidity);
    }
    
    return result;
  }
};

// Utility functions for validation
export const ValidationUtils = {
  // Debounced validation for real-time feedback
  debounceValidation: (validator, delay = 300) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      return new Promise((resolve) => {
        timeoutId = setTimeout(() => {
          resolve(validator(...args));
        }, delay);
      });
    };
  },

  // Format validation errors for display
  formatErrors: (errors, showFieldNames = true) => {
    if (!Array.isArray(errors)) return [];
    
    return errors.map(error => {
      if (error instanceof ValidationError) {
        return showFieldNames && error.field 
          ? `${error.field}: ${error.message}`
          : error.message;
      }
      return error.toString();
    });
  },

  // Check if form data has changed
  hasFormChanged: (original, current, ignoredFields = []) => {
    const originalKeys = Object.keys(original).filter(key => !ignoredFields.includes(key));
    const currentKeys = Object.keys(current).filter(key => !ignoredFields.includes(key));
    
    if (originalKeys.length !== currentKeys.length) return true;
    
    return originalKeys.some(key => {
      const originalValue = original[key];
      const currentValue = current[key];
      
      // Handle nested objects
      if (typeof originalValue === 'object' && typeof currentValue === 'object') {
        return JSON.stringify(originalValue) !== JSON.stringify(currentValue);
      }
      
      return originalValue !== currentValue;
    });
  },

  // Sanitize input data
  sanitizeInput: (data, options = {}) => {
    const {
      trimStrings = true,
      removeEmptyStrings = false,
      convertNumbers = true
    } = options;
    
    const sanitized = { ...data };
    
    Object.keys(sanitized).forEach(key => {
      let value = sanitized[key];
      
      if (typeof value === 'string') {
        if (trimStrings) {
          value = value.trim();
        }
        if (removeEmptyStrings && value === '') {
          delete sanitized[key];
          return;
        }
        if (convertNumbers && !isNaN(value) && value !== '') {
          value = parseFloat(value);
        }
      }
      
      sanitized[key] = value;
    });
    
    return sanitized;
  }
};

export default {
  ValidationError,
  ValidationResult,
  ValidationRules,
  FormValidators,
  ValidationUtils
};