import express from 'express';
import AiModel from '../models/AiModel.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// @route   GET /api/ai-models
// @desc    Get all available AI models
// @access  Private
router.get('/', async (req, res) => {
  try {
    // Get only active models
    const models = await AiModel.find({ 
      status: 'active' 
    }).sort({ 
      type: 1, 
      version: -1 
    });

    // Group by type and return latest version of each type
    const modelsByType = {};
    models.forEach(model => {
      if (!modelsByType[model.type] || 
          modelsByType[model.type].version < model.version) {
        modelsByType[model.type] = model;
      }
    });

    const availableModels = Object.values(modelsByType);

    res.json({
      success: true,
      data: availableModels,
      count: availableModels.length,
      message: 'AI models retrieved successfully'
    });

  } catch (error) {
    console.error('Get AI models error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve AI models'
    });
  }
});

// @route   GET /api/ai-models/:id/performance
// @desc    Get AI model performance metrics
// @access  Private
router.get('/:id/performance', async (req, res) => {
  try {
    const model = await AiModel.findById(req.params.id);

    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'AI model not found'
      });
    }

    // Extract performance metrics
    const performanceData = {
      modelId: model._id,
      type: model.type,
      version: model.version,
      accuracy: model.performance.accuracy,
      totalPredictions: model.performance.totalPredictions,
      successRate: model.performance.successRate,
      averageConfidence: model.performance.averageConfidence,
      lastUpdated: model.performance.lastUpdated,
      metrics: model.performance.metrics,
      status: model.status,
      description: model.description
    };

    res.json({
      success: true,
      data: performanceData,
      message: 'Model performance retrieved successfully'
    });

  } catch (error) {
    console.error('Get model performance error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid model ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve model performance'
    });
  }
});

// @route   GET /api/ai-models/types
// @desc    Get available AI model types
// @access  Private
router.get('/types', async (req, res) => {
  try {
    const modelTypes = [
      {
        type: 'javascript',
        name: 'JavaScript Prediction Engine',
        description: 'Built-in JavaScript-based prediction model',
        availability: 'always',
        features: ['Fast processing', 'No external dependencies', 'Reliable fallback']
      },
      {
        type: 'python_ml',
        name: 'Python Machine Learning Model',
        description: 'Advanced ML model using Python scikit-learn',
        availability: 'service_dependent',
        features: ['High accuracy', 'Advanced algorithms', 'Continuous learning']
      },
      {
        type: 'ensemble',
        name: 'Ensemble Prediction',
        description: 'Combines multiple models for best results',
        availability: 'conditional',
        features: ['Best accuracy', 'Multiple algorithms', 'Confidence scoring']
      },
      {
        type: 'external_api',
        name: 'External API Integration',
        description: 'Third-party AI service integration',
        availability: 'api_dependent',
        features: ['Cloud-based', 'Latest models', 'Scalable processing']
      }
    ];

    res.json({
      success: true,
      data: modelTypes,
      count: modelTypes.length,
      message: 'AI model types retrieved successfully'
    });

  } catch (error) {
    console.error('Get model types error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve model types'
    });
  }
});

export default router;