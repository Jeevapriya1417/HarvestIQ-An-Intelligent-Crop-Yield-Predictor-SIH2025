// AI Controller
import { spawn } from 'child_process';
import { join } from 'path';
import { validatePredictionInput } from '../utils/validation.js';
import AiModel from '../models/AiModel.js';

/**
 * Run Python prediction model
 * @param {Object} data - Input data for prediction
 * @returns {Promise<Object>}
 */
const runPythonModel = (data) => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [
      join(__dirname, '../../Py model', 'harvest.py'),
      JSON.stringify(data)
    ]);

    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0 && result) {
        try {
          const parsedResult = JSON.parse(result);
          resolve({ success: true, data: parsedResult });
        } catch (parseError) {
          reject({ success: false, error: 'Failed to parse model output' });
        }
      } else {
        reject({ success: false, error: error || `Python process exited with code ${code}` });
      }
    });
  });
};

/**
 * Get available AI models
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
export const getAvailableModels = async (req, res, next) => {
  try {
    const models = await AiModel.find({ isActive: true });
    
    res.json({
      success: true,
      data: { models }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crop yield prediction
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
export const predictYield = async (req, res, next) => {
  try {
    // Validate input data
    const { error, value } = validatePredictionInput(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    // Find AI model
    const aiModel = await AiModel.findOne({
      cropType: value.crop,
      region: value.state,
      isActive: true,
      modelType: 'python-ml'
    });
    
    if (!aiModel) {
      return res.status(404).json({
        success: false,
        error: 'No suitable AI model found'
      });
    }
    
    // Run Python model
    const result = await runPythonModel(value);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }
    
    // Return prediction
    res.json({
      success: true,
      data: {
        prediction: result.data,
        model: aiModel._id,
        confidence: 0.95 // Default confidence score
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Run AI prediction
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
export const runPrediction = async (req, res, next) => {
  try {
    // Validate input data
    const { error, value } = validatePredictionInput(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    // Find AI model
    const aiModel = await AiModel.findOne({
      cropType: value.crop,
      region: value.state,
      isActive: true
    });
    
    if (!aiModel) {
      return res.status(404).json({
        success: false,
        error: 'No suitable AI model found'
      });
    }
    
    // Run model based on type
    let predictionResult;
    
    if (aiModel.type === 'python-ml') {
      // Run Python model
      predictionResult = await runPythonModel(value);
    } else {
      // For JavaScript models, use the existing prediction engine
      // This would be implemented separately
      predictionResult = { success: false, error: 'JavaScript model integration not implemented yet' };
    }
    
    if (!predictionResult.success) {
      return res.status(500).json({
        success: false,
        error: predictionResult.error
      });
    }
    
    // Return prediction
    res.json({
      success: true,
      data: {
        prediction: predictionResult.data,
        model: aiModel._id,
        modelName: aiModel.name,
        modelVersion: aiModel.version,
        modelType: aiModel.type,
        confidence: 0.95 // Default confidence score
      }
    });
  } catch (error) {
    next(error);
  }
};