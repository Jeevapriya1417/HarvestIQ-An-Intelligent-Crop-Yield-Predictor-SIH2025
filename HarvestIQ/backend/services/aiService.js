import axios from 'axios';
import AiModel from '../models/AiModel.js';
import { dataTransformer } from './dataTransformer.js';

class AIService {
  constructor() {
    this.pythonServiceUrl = process.env.PYTHON_AI_SERVICE_URL || 'http://localhost:8000';
    this.defaultTimeout = parseInt(process.env.AI_SERVICE_TIMEOUT) || 30000;
    this.maxRetries = 3;
  }

  /**
   * Generate prediction using the specified AI model
   * @param {Object} inputData - Raw input data from frontend
   * @param {Object} aiModel - AI model configuration
   * @param {String} userId - User ID for context
   * @returns {Object} Prediction result
   */
  async generatePrediction(inputData, aiModel = null, userId = null) {
    try {
      // If no model specified, use default JavaScript model
      if (!aiModel) {
        return await this.generateJavaScriptPrediction(inputData, userId);
      }

      // Route to appropriate prediction method based on model type
      switch (aiModel.type) {
        case 'javascript':
          return await this.generateJavaScriptPrediction(inputData, userId);
        
        case 'python-ml':
        case 'python-dl':
          return await this.generatePythonPrediction(inputData, aiModel, userId);
        
        case 'ensemble':
          return await this.generateEnsemblePrediction(inputData, aiModel, userId);
        
        case 'external-api':
          return await this.generateExternalAPIPrediction(inputData, aiModel, userId);
        
        default:
          throw new Error(`Unsupported model type: ${aiModel.type}`);
      }

    } catch (error) {
      console.error('AI Service prediction error:', error);
      
      // Fallback to JavaScript model if available
      if (aiModel && aiModel.type !== 'javascript') {
        console.warn('Falling back to JavaScript prediction engine');
        return await this.generateJavaScriptPrediction(inputData, userId);
      }
      
      throw error;
    }
  }

  /**
   * Generate prediction using JavaScript prediction engine (fallback)
   */
  async generateJavaScriptPrediction(inputData, userId) {
    try {
      // Transform data for JavaScript engine
      const transformedData = dataTransformer.toJavaScriptFormat(inputData, userId);
      
      // Simple fallback prediction logic
      const result = this.calculateSimplePrediction(transformedData);
      
      return {
        results: {
          expectedYield: parseFloat(result.expectedYield),
          yieldPerHectare: parseFloat(result.yieldPerHectare),
          totalYield: parseFloat(result.totalYield),
          confidence: result.confidence || 85,
          factors: result.factors || {}
        },
        recommendations: result.recommendations || [],
        governmentData: result.governmentData || {},
        modelInfo: {
          type: 'javascript',
          name: 'JavaScript-Fallback',
          version: '1.0.0'
        }
      };

    } catch (error) {
      console.error('JavaScript prediction error:', error);
      throw new Error('JavaScript prediction engine failed');
    }
  }

  /**
   * Generate prediction using Python ML/DL models
   */
  async generatePythonPrediction(inputData, aiModel, userId) {
    try {
      // Transform data for Python model
      const transformedData = dataTransformer.toPythonFormat(inputData, aiModel, userId);
      
      // Prepare request configuration
      const config = {
        timeout: aiModel.configuration?.requirements?.timeout || this.defaultTimeout,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'HarvestIQ-Backend/1.0.0'
        }
      };

      // Add API key if required
      if (aiModel.configuration?.apiKey) {
        config.headers['Authorization'] = `Bearer ${aiModel.configuration.apiKey}`;
      }

      // Make request to Python AI service
      const serviceUrl = aiModel.configuration?.serviceUrl || this.pythonServiceUrl;
      const endpoint = `${serviceUrl}/predict`;
      
      const response = await this.makeRequestWithRetry(endpoint, transformedData, config);
      
      // Transform response back to standard format
      const result = dataTransformer.fromPythonFormat(response.data, aiModel);
      
      return {
        results: result.results,
        recommendations: result.recommendations || [],
        governmentData: result.governmentData || {},
        modelInfo: {
          type: aiModel.type,
          name: aiModel.name,
          version: aiModel.version,
          processingTime: response.data.processingTime || 0
        }
      };

    } catch (error) {
      console.error('Python prediction error:', error);
      throw new Error(`Python AI service failed: ${error.message}`);
    }
  }

  /**
   * Generate prediction using ensemble of multiple models
   */
  async generateEnsemblePrediction(inputData, aiModel, userId) {
    try {
      const ensembleModels = aiModel.configuration?.ensembleModels || [];
      
      if (ensembleModels.length === 0) {
        throw new Error('No ensemble models configured');
      }

      // Get predictions from all models in ensemble
      const predictions = await Promise.allSettled(
        ensembleModels.map(async (modelId) => {
          const model = await AiModel.findById(modelId);
          if (!model || !model.status.isActive) {
            throw new Error(`Ensemble model ${modelId} not available`);
          }
          return await this.generatePrediction(inputData, model, userId);
        })
      );

      // Filter successful predictions
      const successfulPredictions = predictions
        .filter(p => p.status === 'fulfilled')
        .map(p => p.value);

      if (successfulPredictions.length === 0) {
        throw new Error('All ensemble models failed');
      }

      // Combine predictions using weighted average
      const combinedResult = this.combineEnsemblePredictions(successfulPredictions, aiModel);
      
      return {
        results: combinedResult.results,
        recommendations: combinedResult.recommendations,
        governmentData: combinedResult.governmentData,
        modelInfo: {
          type: 'ensemble',
          name: aiModel.name,
          version: aiModel.version,
          ensembleSize: successfulPredictions.length
        }
      };

    } catch (error) {
      console.error('Ensemble prediction error:', error);
      throw new Error(`Ensemble prediction failed: ${error.message}`);
    }
  }

  /**
   * Generate prediction using external API
   */
  async generateExternalAPIPrediction(inputData, aiModel, userId) {
    try {
      // Transform data for external API
      const transformedData = dataTransformer.toExternalAPIFormat(inputData, aiModel, userId);
      
      const config = {
        timeout: aiModel.configuration?.requirements?.timeout || this.defaultTimeout,
        headers: {
          'Content-Type': 'application/json',
          ...aiModel.configuration?.headers
        }
      };

      // Add authentication
      if (aiModel.configuration?.apiKey) {
        config.headers['Authorization'] = `Bearer ${aiModel.configuration.apiKey}`;
      }

      const response = await this.makeRequestWithRetry(
        aiModel.configuration.serviceUrl,
        transformedData,
        config
      );
      
      // Transform response
      const result = dataTransformer.fromExternalAPIFormat(response.data, aiModel);
      
      return {
        results: result.results,
        recommendations: result.recommendations || [],
        governmentData: result.governmentData || {},
        modelInfo: {
          type: 'external-api',
          name: aiModel.name,
          version: aiModel.version
        }
      };

    } catch (error) {
      console.error('External API prediction error:', error);
      throw new Error(`External API prediction failed: ${error.message}`);
    }
  }

  /**
   * Make HTTP request with retry logic
   */
  async makeRequestWithRetry(url, data, config, retryCount = 0) {
    try {
      const response = await axios.post(url, data, config);
      return response;
    } catch (error) {
      if (retryCount < this.maxRetries && this.isRetryableError(error)) {
        console.warn(`Request failed, retrying (${retryCount + 1}/${this.maxRetries}):`, error.message);
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.makeRequestWithRetry(url, data, config, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Check if error is retryable
   */
  isRetryableError(error) {
    return (
      error.code === 'ECONNABORTED' || // Timeout
      error.code === 'ECONNRESET' ||   // Connection reset
      error.code === 'ENOTFOUND' ||    // DNS lookup failed
      (error.response && error.response.status >= 500) // Server errors
    );
  }

  /**
   * Combine ensemble predictions using weighted average
   */
  combineEnsemblePredictions(predictions, aiModel) {
    const weights = aiModel.configuration?.ensembleWeights || 
                   predictions.map(() => 1 / predictions.length); // Equal weights

    // Weighted average for yield predictions
    let totalWeight = 0;
    let weightedYield = 0;
    let weightedConfidence = 0;

    predictions.forEach((pred, index) => {
      const weight = weights[index] || (1 / predictions.length);
      totalWeight += weight;
      weightedYield += pred.results.expectedYield * weight;
      weightedConfidence += pred.results.confidence * weight;
    });

    // Combine recommendations (remove duplicates)
    const allRecommendations = predictions.flatMap(p => p.recommendations || []);
    const uniqueRecommendations = allRecommendations.filter((rec, index, arr) =>
      index === arr.findIndex(r => r.title === rec.title)
    );

    // Use government data from first successful prediction
    const governmentData = predictions[0]?.governmentData || {};

    return {
      results: {
        expectedYield: Number((weightedYield / totalWeight).toFixed(2)),
        yieldPerHectare: Number((weightedYield / totalWeight).toFixed(2)),
        totalYield: Number((weightedYield / totalWeight).toFixed(2)),
        confidence: Number((weightedConfidence / totalWeight).toFixed(0)),
        factors: {
          ensembleMethod: 'weighted-average',
          modelCount: predictions.length,
          weights: weights
        }
      },
      recommendations: uniqueRecommendations.slice(0, 10), // Limit to top 10
      governmentData
    };
  }

  /**
   * Health check for AI services
   */
  async healthCheck(aiModel) {
    try {
      if (aiModel.type === 'javascript') {
        return { status: 'healthy', responseTime: 0 };
      }

      const startTime = Date.now();
      const serviceUrl = aiModel.configuration?.serviceUrl || this.pythonServiceUrl;
      
      const response = await axios.get(`${serviceUrl}/health`, {
        timeout: 5000,
        headers: aiModel.configuration?.apiKey ? {
          'Authorization': `Bearer ${aiModel.configuration.apiKey}`
        } : {}
      });

      const responseTime = Date.now() - startTime;
      
      return {
        status: response.data.status || 'healthy',
        responseTime,
        details: response.data
      };

    } catch (error) {
      return {
        status: 'down',
        error: error.message,
        responseTime: -1
      };
    }
  }

  /**
   * Validate input data for AI model
   */
  validateInputData(inputData, aiModel) {
    const errors = [];

    // Basic validation
    if (!inputData.cropType) {
      errors.push('Crop type is required');
    }

    if (!inputData.farmArea || inputData.farmArea <= 0) {
      errors.push('Valid farm area is required');
    }

    if (!inputData.region) {
      errors.push('Region is required');
    }

    // Model-specific validation
    if (aiModel?.configuration?.inputSchema) {
      // Validate against model's input schema
      // This would use a JSON schema validator
      // For now, we'll do basic checks
    }

    return errors;
  }

  /**
   * Simple fallback prediction calculation
   */
  calculateSimplePrediction(inputData) {
    // Base yields for different crops (tons per hectare)
    const baseYields = {
      'wheat': 4.5,
      'rice': 6.2,
      'sugarcane': 75,
      'cotton': 2.8,
      'maize': 5.4,
      'barley': 3.2
    };

    const cropType = inputData.cropType?.toLowerCase() || 'wheat';
    let baseYield = baseYields[cropType] || 3.0;
    let yieldFactor = 1.0;

    // Simple weather factors
    if (inputData.temperature) {
      const temp = parseFloat(inputData.temperature);
      if (temp >= 15 && temp <= 30) yieldFactor *= 1.1;
      else if (temp < 5 || temp > 40) yieldFactor *= 0.8;
    }

    if (inputData.rainfall) {
      const rainfall = parseFloat(inputData.rainfall);
      if (rainfall >= 400 && rainfall <= 1000) yieldFactor *= 1.1;
      else if (rainfall < 200) yieldFactor *= 0.7;
    }

    // Soil factors
    if (inputData.phLevel) {
      const pH = parseFloat(inputData.phLevel);
      if (pH >= 6.0 && pH <= 7.5) yieldFactor *= 1.05;
      else if (pH < 5.0 || pH > 8.5) yieldFactor *= 0.9;
    }

    const expectedYield = baseYield * yieldFactor;
    const farmArea = parseFloat(inputData.farmArea) || 1;
    const totalYield = expectedYield * farmArea;

    return {
      expectedYield: expectedYield.toFixed(2),
      yieldPerHectare: expectedYield.toFixed(2),
      totalYield: totalYield.toFixed(2),
      confidence: Math.min(95, Math.max(75, 85 + Math.random() * 10)),
      factors: {
        baseYield,
        yieldFactor: yieldFactor.toFixed(3),
        method: 'simple-calculation'
      },
      recommendations: this.generateSimpleRecommendations(inputData, yieldFactor),
      governmentData: {}
    };
  }

  /**
   * Generate simple recommendations
   */
  generateSimpleRecommendations(inputData, yieldFactor) {
    const recommendations = [];

    if (yieldFactor < 0.9) {
      recommendations.push({
        type: 'improvement',
        priority: 'high',
        title: 'Yield Enhancement Required',
        description: 'Current conditions may reduce yield. Consider soil improvement and irrigation.',
        action: 'Review farming practices and soil health'
      });
    }

    if (inputData.phLevel && (parseFloat(inputData.phLevel) < 6.0 || parseFloat(inputData.phLevel) > 7.5)) {
      recommendations.push({
        type: 'soil',
        priority: 'medium',
        title: 'Soil pH Adjustment',
        description: 'Soil pH is outside optimal range. Consider lime or sulfur application.',
        action: 'Test soil and adjust pH levels'
      });
    }

    if (inputData.rainfall && parseFloat(inputData.rainfall) < 400) {
      recommendations.push({
        type: 'irrigation',
        priority: 'high',
        title: 'Irrigation Required',
        description: 'Low rainfall detected. Plan for supplemental irrigation.',
        action: 'Install efficient irrigation systems'
      });
    }

    return recommendations;
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;