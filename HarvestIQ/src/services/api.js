import axios from 'axios';

// Create axios instance with base configuration
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('harvestiq_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('harvestiq_token');
      localStorage.removeItem('harvestiq_user');
      
      // Only redirect if not already on auth page
      if (window.location.pathname !== '/auth' && window.location.pathname !== '/') {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication API functions
export const authAPI = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await API.post('/auth/register', userData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
        errors: error.response?.data?.errors || []
      };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await API.post('/auth/login', credentials);
      
      // Store token and user data
      if (response.data.success) {
        localStorage.setItem('harvestiq_token', response.data.data.token);
        localStorage.setItem('harvestiq_user', JSON.stringify(response.data.data.user));
      }
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
        errors: error.response?.data?.errors || []
      };
    }
  },

  // Logout user
  logout: async () => {
    try {
      await API.post('/auth/logout');
      
      // Clear local storage
      localStorage.removeItem('harvestiq_token');
      localStorage.removeItem('harvestiq_user');
      
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      // Even if API call fails, clear local storage
      localStorage.removeItem('harvestiq_token');
      localStorage.removeItem('harvestiq_user');
      
      return {
        success: true,
        message: 'Logged out successfully'
      };
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await API.get('/auth/profile');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch profile'
      };
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await API.put('/auth/profile', profileData);
      
      // Update local storage with new user data
      if (response.data.success) {
        localStorage.setItem('harvestiq_user', JSON.stringify(response.data.data.user));
      }
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update profile'
      };
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await API.put('/auth/change-password', passwordData);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to change password'
      };
    }
  }
};

// Prediction API functions for AI-ready infrastructure
export const predictionAPI = {
  // Create new prediction with AI service integration
  createPrediction: async (predictionData) => {
    try {
      const response = await API.post('/predictions', predictionData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create prediction',
        errors: error.response?.data?.errors || []
      };
    }
  },

  // Get all predictions for current user
  getPredictions: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add query parameters if provided
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);
      if (params.crop) queryParams.append('crop', params.crop);
      if (params.aiModel) queryParams.append('aiModel', params.aiModel);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      const queryString = queryParams.toString();
      const url = queryString ? `/predictions?${queryString}` : '/predictions';
      
      const response = await API.get(url);
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch predictions'
      };
    }
  },

  // Get single prediction by ID
  getPrediction: async (predictionId) => {
    try {
      const response = await API.get(`/predictions/${predictionId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch prediction'
      };
    }
  },

  // Update prediction
  updatePrediction: async (predictionId, updateData) => {
    try {
      const response = await API.put(`/predictions/${predictionId}`, updateData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update prediction',
        errors: error.response?.data?.errors || []
      };
    }
  },

  // Delete prediction
  deletePrediction: async (predictionId) => {
    try {
      const response = await API.delete(`/predictions/${predictionId}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete prediction'
      };
    }
  },

  // Add user feedback to prediction
  addFeedback: async (predictionId, feedbackData) => {
    try {
      const response = await API.post(`/predictions/${predictionId}/feedback`, feedbackData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add feedback',
        errors: error.response?.data?.errors || []
      };
    }
  },

  // Archive prediction
  archivePrediction: async (predictionId) => {
    try {
      const response = await API.post(`/predictions/${predictionId}/archive`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to archive prediction'
      };
    }
  },

  // Get user prediction statistics
  getUserStats: async () => {
    try {
      const response = await API.get('/predictions/stats');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch statistics'
      };
    }
  }
};

// Field management API functions
export const fieldAPI = {
  // Create new field
  createField: async (fieldData) => {
    try {
      const response = await API.post('/fields', fieldData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create field',
        errors: error.response?.data?.errors || []
      };
    }
  },

  // Get all fields for current user
  getFields: async () => {
    try {
      const response = await API.get('/fields');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch fields'
      };
    }
  },

  // Get single field by ID
  getField: async (fieldId) => {
    try {
      const response = await API.get(`/fields/${fieldId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch field'
      };
    }
  },

  // Update field
  updateField: async (fieldId, updateData) => {
    try {
      const response = await API.put(`/fields/${fieldId}`, updateData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update field',
        errors: error.response?.data?.errors || []
      };
    }
  },

  // Delete field
  deleteField: async (fieldId) => {
    try {
      const response = await API.delete(`/fields/${fieldId}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete field'
      };
    }
  }
};

// AI Model management API functions
export const aiModelAPI = {
  // Get available AI models
  getModels: async () => {
    try {
      const response = await API.get('/ai-models');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch AI models'
      };
    }
  },

  // Get AI model performance metrics
  getModelPerformance: async (modelId) => {
    try {
      const response = await API.get(`/ai-models/${modelId}/performance`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch model performance'
      };
    }
  }
};

// Legacy prediction function for backward compatibility
export const generatePrediction = async (inputData) => {
  try {
    // Transform input data to match new API format
    const predictionData = {
      inputData: {
        location: inputData.location || '',
        cropType: inputData.cropType || '',
        plantingDate: inputData.plantingDate || '',
        fieldSize: inputData.fieldSize || 0,
        soilType: inputData.soilType || '',
        lastYearYield: inputData.lastYearYield || 0,
        fertilizer: inputData.fertilizer || '',
        irrigationMethod: inputData.irrigationMethod || '',
        previousCrop: inputData.previousCrop || '',
        weatherCondition: inputData.weatherCondition || '',
        seedVariety: inputData.seedVariety || ''
      },
      preferences: {
        aiModel: 'javascript', // Default to JavaScript engine for backward compatibility
        includeRecommendations: true
      }
    };

    const result = await predictionAPI.createPrediction(predictionData);
    
    if (result.success) {
      // Return in legacy format for existing components
      return {
        success: true,
        prediction: result.data.results,
        recommendations: result.data.recommendations,
        confidence: result.data.confidence
      };
    } else {
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'Prediction generation failed'
    };
  }
};

// Health check function
export const checkServerHealth = async () => {
  try {
    const response = await API.get('/health');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: 'Server is unavailable'
    };
  }
};

export default API;