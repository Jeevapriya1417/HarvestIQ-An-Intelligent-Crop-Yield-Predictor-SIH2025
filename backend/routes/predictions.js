import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Prediction from '../models/Prediction.js';
import AiModel from '../models/AiModel.js';
import Field from '../models/Field.js';
import { protect } from '../middleware/auth.js';
import { aiService } from '../services/aiService.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Validation middleware
const validatePredictionInput = [
  body('inputData.cropType')
    .notEmpty()
    .withMessage('Crop type is required'),
  
  body('inputData.farmArea')
    .isFloat({ min: 0.01 })
    .withMessage('Farm area must be at least 0.01 hectares'),
  
  body('inputData.region')
    .notEmpty()
    .withMessage('Region is required'),
  
  body('inputData.phLevel')
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 14 })
    .withMessage('pH level must be between 0 and 14'),
  
  body('inputData.temperature')
    .optional({ nullable: true })
    .isFloat()
    .withMessage('Temperature must be a valid number'),
  
  body('inputData.rainfall')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Rainfall must be a positive number'),
  
  body('inputData.humidity')
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 100 })
    .withMessage('Humidity must be between 0 and 100'),
  
  body('aiModel.modelId')
    .optional()
    .isMongoId()
    .withMessage('Invalid model ID')
];

// @desc    Create new prediction
// @route   POST /api/predictions
// @access  Private
export const createPrediction = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { inputData, aiModel, field } = req.body;

    // Validate field ownership if field is specified
    if (field) {
      const userField = await Field.findOne({ _id: field, user: req.user._id });
      if (!userField) {
        return res.status(404).json({
          success: false,
          message: 'Field not found or access denied'
        });
      }
    }

    // Determine AI model to use
    let selectedModel;
    if (aiModel?.modelId) {
      console.log('\n🤖 [PREDICTION] User specified model ID:', aiModel.modelId);
      selectedModel = await AiModel.findById(aiModel.modelId);
      if (!selectedModel || !selectedModel.isActive) {
        console.log('❌ [PREDICTION] Selected model not found or inactive');
        return res.status(400).json({
          success: false,
          message: 'Selected AI model is not available'
        });
      }
      console.log('✅ [PREDICTION] Using user-specified model:', selectedModel.name, '| Type:', selectedModel.type);
    } else {
      console.log('\n🤖 [PREDICTION] No model specified, finding default for crop:', inputData.cropType);
      
      // Try to find active python-ml model first
      selectedModel = await AiModel.findOne({ 
        type: 'python-ml',
        isActive: true 
      });
      
      if (selectedModel) {
        console.log('✅ [PREDICTION] Found Python ML model:', selectedModel.name, '| Accuracy:', selectedModel.accuracy + '%');
      } else {
        console.log('⚠️  [PREDICTION] No Python ML model found, looking for JavaScript model...');
        // Fallback to JavaScript model
        selectedModel = await AiModel.findOne({ 
          type: 'javascript',
          isActive: true 
        });
        
        if (selectedModel) {
          console.log('✅ [PREDICTION] Using JavaScript model:', selectedModel.name);
        } else {
          console.log('⚠️  [PREDICTION] No model found in DB, will use hardcoded JS fallback');
          selectedModel = null;
        }
      }
    }
    
    console.log('📊 [PREDICTION] Selected Model Summary:');
    console.log('   - Name:', selectedModel?.name || 'Hardcoded JS Fallback');
    console.log('   - Type:', selectedModel?.type || 'javascript');
    console.log('   - Version:', selectedModel?.version || '1.0.0');
    console.log('   - Active:', selectedModel?.isActive ?? 'N/A');

    // Create prediction record
    const prediction = new Prediction({
      user: req.user._id,
      field: field || null,
      inputData: {
        ...inputData,
        additionalParams: inputData.additionalParams || new Map()
      },
      aiModel: {
        modelId: selectedModel?._id || null,
        modelName: selectedModel?.name || 'JavaScript-Default',
        modelVersion: selectedModel?.version || '1.0.0',
        modelType: selectedModel?.type || 'javascript'
      },
      processing: {
        status: 'processing',
        processingTime: 0
      }
    });

    await prediction.save();

    // Generate prediction using AI service
    const startTime = Date.now();
    try {
      const predictionResult = await aiService.generatePrediction(
        inputData,
        selectedModel,
        req.user._id
      );

      // Update prediction with results
      prediction.results = predictionResult.results;
      prediction.recommendations = predictionResult.recommendations || [];
      prediction.governmentData = predictionResult.governmentData || {};
      prediction.processing.status = 'completed';
      prediction.processing.processingTime = Date.now() - startTime;

      await prediction.save();

      // Update model performance
      if (selectedModel) {
        await selectedModel.updatePerformance({
          success: true,
          processingTime: prediction.processing.processingTime
        });
      }

      res.status(201).json({
        success: true,
        message: 'Prediction created successfully',
        data: {
          prediction: await prediction.populate('field', 'name location.address')
        }
      });

    } catch (aiError) {
      console.error('AI prediction error:', aiError);
      
      // Update prediction status to failed
      prediction.processing.status = 'failed';
      prediction.processing.errorMessage = aiError.message;
      await prediction.save();

      // Update model performance
      if (selectedModel) {
        await selectedModel.updatePerformance({ success: false });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to generate prediction',
        error: process.env.NODE_ENV === 'development' ? aiError.message : 'Internal server error'
      });
    }

  } catch (error) {
    console.error('Create prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating prediction'
    });
  }
};

// @desc    Get user's predictions
// @route   GET /api/predictions
// @access  Private
export const getPredictions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      cropType,
      region,
      modelType,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const options = {};
    if (cropType) options.cropType = cropType;
    if (region) options.region = region;
    if (modelType) options.modelType = modelType;

    const query = { user: req.user._id, isArchived: false };
    
    if (status) {
      query['processing.status'] = status;
    }
    
    if (cropType) {
      query['inputData.cropType'] = cropType;
    }
    
    if (region) {
      query['inputData.region'] = region;
    }
    
    if (modelType) {
      query['aiModel.modelType'] = modelType;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [predictions, totalCount] = await Promise.all([
      Prediction.find(query)
        .populate('field', 'name location.address')
        .populate('aiModel.modelId', 'name version type')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Prediction.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: {
        predictions,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get predictions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching predictions'
    });
  }
};

// @desc    Get single prediction
// @route   GET /api/predictions/:id
// @access  Private
export const getPrediction = async (req, res) => {
  try {
    const prediction = await Prediction.findOne({
      _id: req.params.id,
      user: req.user._id
    })
      .populate('field', 'name location.address area')
      .populate('aiModel.modelId', 'name version type description');

    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: 'Prediction not found'
      });
    }

    res.json({
      success: true,
      data: { prediction }
    });

  } catch (error) {
    console.error('Get prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching prediction'
    });
  }
};

// @desc    Update prediction (notes, tags, feedback)
// @route   PUT /api/predictions/:id
// @access  Private
export const updatePrediction = async (req, res) => {
  try {
    const { notes, tags, userFeedback } = req.body;

    const prediction = await Prediction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: 'Prediction not found'
      });
    }

    // Update allowed fields
    if (notes !== undefined) prediction.notes = notes;
    if (tags !== undefined) prediction.tags = tags;
    if (userFeedback !== undefined) {
      prediction.userFeedback = { ...prediction.userFeedback, ...userFeedback };
      
      // Update AI model rating if provided
      if (userFeedback.rating && prediction.aiModel.modelId) {
        const aiModel = await AiModel.findById(prediction.aiModel.modelId);
        if (aiModel) {
          await aiModel.addUserRating(userFeedback.rating);
        }
      }
    }

    await prediction.save();

    res.json({
      success: true,
      message: 'Prediction updated successfully',
      data: { prediction }
    });

  } catch (error) {
    console.error('Update prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating prediction'
    });
  }
};

// @desc    Archive prediction
// @route   DELETE /api/predictions/:id
// @access  Private
export const archivePrediction = async (req, res) => {
  try {
    const prediction = await Prediction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: 'Prediction not found'
      });
    }

    await prediction.archive();

    res.json({
      success: true,
      message: 'Prediction archived successfully'
    });

  } catch (error) {
    console.error('Archive prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error archiving prediction'
    });
  }
};

// @desc    Get prediction statistics
// @route   GET /api/predictions/stats
// @access  Private
export const getPredictionStats = async (req, res) => {
  try {
    const [userStats] = await Prediction.getStatsByUser(req.user._id);
    
    const additionalStats = await Prediction.aggregate([
      { $match: { user: req.user._id, isArchived: false } },
      {
        $group: {
          _id: null,
          cropTypeDistribution: {
            $push: '$inputData.cropType'
          },
          regionDistribution: {
            $push: '$inputData.region'
          },
          modelTypeDistribution: {
            $push: '$aiModel.modelType'
          },
          monthlyPredictions: {
            $push: {
              month: { $month: '$createdAt' },
              year: { $year: '$createdAt' }
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: userStats || {
          totalPredictions: 0,
          averageConfidence: 0,
          averageYield: 0,
          cropTypes: [],
          latestPrediction: null
        },
        distributions: additionalStats[0] || {
          cropTypeDistribution: [],
          regionDistribution: [],
          modelTypeDistribution: [],
          monthlyPredictions: []
        }
      }
    });

  } catch (error) {
    console.error('Get prediction stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching prediction statistics'
    });
  }
};

// @desc    Get available AI models
// @route   GET /api/predictions/models
// @access  Private
export const getAvailableModels = async (req, res) => {
  try {
    const { crop, region } = req.query;
    
    const models = await AiModel.findActive({ crop, region });

    res.json({
      success: true,
      data: { models }
    });

  } catch (error) {
    console.error('Get available models error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching available models'
    });
  }
};

// Routes
router.post('/', validatePredictionInput, createPrediction);
router.get('/', getPredictions);
router.get('/stats', getPredictionStats);
router.get('/models', getAvailableModels);
router.get('/:id', getPrediction);
router.put('/:id', updatePrediction);
router.delete('/:id', archivePrediction);

export default router;