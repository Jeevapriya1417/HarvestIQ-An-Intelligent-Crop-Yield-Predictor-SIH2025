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
    console.log('\n' + '='.repeat(60));
    console.log('🧠 [AI SERVICE] Starting prediction generation');
    console.log('='.repeat(60));
    console.log('📥 Input Data:');
    console.log('   - Crop:', inputData.cropType);
    console.log('   - Farm Area:', inputData.farmArea, 'hectares');
    console.log('   - Region:', inputData.region);
    console.log('🤖 Model Info:');
    console.log('   - Model:', aiModel ? aiModel.name : 'None (will use fallback)');
    console.log('   - Type:', aiModel ? aiModel.type : 'javascript');
    console.log('   - User ID:', userId);
    
    try {
      // If no model specified, use default JavaScript model
      if (!aiModel) {
        console.log('\n⚠️  [AI SERVICE] No model provided, using JavaScript fallback');
        return await this.generateJavaScriptPrediction(inputData, userId);
      }

      // Route to appropriate prediction method based on model type
      console.log('\n🔀 [AI SERVICE] Routing to prediction engine:', aiModel.type);
      
      switch (aiModel.type) {
        case 'javascript':
          console.log('📦 [AI SERVICE] Using JavaScript prediction engine');
          return await this.generateJavaScriptPrediction(inputData, userId);
        
        case 'python-ml':
        case 'python-dl':
          console.log('🐍 [AI SERVICE] Using Python ML/DL prediction engine');
          return await this.generatePythonPrediction(inputData, aiModel, userId);
        
        case 'ensemble':
          console.log('🎭 [AI SERVICE] Using Ensemble prediction engine');
          return await this.generateEnsemblePrediction(inputData, aiModel, userId);
        
        case 'external-api':
          console.log('🌐 [AI SERVICE] Using External API prediction engine');
          return await this.generateExternalAPIPrediction(inputData, aiModel, userId);
        
        default:
          console.error('❌ [AI SERVICE] Unsupported model type:', aiModel.type);
          throw new Error(`Unsupported model type: ${aiModel.type}`);
      }

    } catch (error) {
      console.error('\n❌ [AI SERVICE] Prediction error:', error.message);
      
      // Only fallback if Python service is genuinely unavailable
      const isConnectionError = error.code === 'ECONNREFUSED' || 
                               error.code === 'ENOTFOUND' ||
                               error.message.includes('Cannot reach');
      
      if (aiModel && aiModel.type !== 'javascript' && isConnectionError) {
        console.warn('⚠️  [AI SERVICE] Python service unavailable, falling back to JS');
        console.warn('   Reason:', error.message);
        return await this.generateJavaScriptPrediction(inputData, userId);
      }
      
      // For other errors, propagate them
      throw error;
    }
  }

  /**
   * Generate prediction using JavaScript prediction engine (fallback)
   */
  async generateJavaScriptPrediction(inputData, userId) {
    try {
      console.log('\n📦 [JS FALLBACK] Using JavaScript prediction engine');
      
      // Transform data for JavaScript engine
      const transformedData = dataTransformer.toJavaScriptFormat(inputData, userId);
      
      // Simple fallback prediction logic
      const result = this.calculateSimplePrediction(transformedData);
      
      console.log('📊 [JS FALLBACK] Prediction Result:');
      console.log('   - Expected Yield:', result.expectedYield);
      console.log('   - Confidence:', result.confidence + '%');
      console.log('   - Method:', result.factors.method);
      console.log('='.repeat(60));
      
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
      console.error('\n❌ [JS FALLBACK] JavaScript prediction failed!');
      console.error('   Error:', error.message);
      throw new Error('JavaScript prediction engine failed');
    }
  }

  /**
   * Generate prediction using Python ML/DL models
   */
  async generatePythonPrediction(inputData, aiModel, userId) {
    try {
      console.log('\n🐍 [PYTHON ML] Starting Python ML prediction');
      console.log('   - Model:', aiModel.name);
      console.log('   - Service URL:', aiModel.configuration?.serviceUrl || this.pythonServiceUrl);
      
      // Transform data for Python model
      const transformedData = dataTransformer.toPythonFormat(inputData, aiModel, userId);
      console.log('🔄 [PYTHON ML] Data transformed for Python service');
      
      // CRITICAL: Validate data is within training ranges before sending
      console.log('\n🔍 [PYTHON ML] Validating input data ranges:');
      console.log('   - Organic Content:', transformedData.soil_data.organic_content_percent, '(valid: 0.1-2.5, training: 0.5-1.5)');
      console.log('   - Nitrogen:', transformedData.soil_data.nitrogen_kg_per_ha, '(valid: 10-200, training: 30-180)');
      console.log('   - Phosphorus:', transformedData.soil_data.phosphorus_kg_per_ha, '(valid: 10-80, training: 20-75)');
      console.log('   - Potassium:', transformedData.soil_data.potassium_kg_per_ha, '(valid: 10-90, training: 20-85)');
      console.log('   - Rainfall:', transformedData.weather_data.annual_rainfall_mm, '(valid: 200-2500, training: 200-2000)');
      
      // Warn if values are outside typical training data range
      if (transformedData.soil_data.organic_content_percent > 2.0) {
        console.warn('⚠️  [PYTHON ML] WARNING: Organic content', transformedData.soil_data.organic_content_percent, 'is above typical training range (0.5-1.5)!');
      }
      if (transformedData.soil_data.nitrogen_kg_per_ha > 180) {
        console.warn('⚠️  [PYTHON ML] WARNING: Nitrogen', transformedData.soil_data.nitrogen_kg_per_ha, 'is above typical training range (30-180)!');
      }
      
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
        console.log('🔑 [PYTHON ML] API key added to request');
      }

      // Make request to Python AI service
      const serviceUrl = aiModel.configuration?.serviceUrl || this.pythonServiceUrl;
      const endpoint = `${serviceUrl}/predict`;
      
      console.log('\n📡 [PYTHON ML] Sending request to:', endpoint);
      console.log('   - Timeout:', config.timeout, 'ms');
      console.log('   - Request body:', JSON.stringify(transformedData, null, 2));
      
      const startTime = Date.now();
      const response = await this.makeRequestWithRetry(endpoint, transformedData, config);
      const responseTime = Date.now() - startTime;
      
      console.log('\n✅ [PYTHON ML] Response received in', responseTime, 'ms');
      console.log('   - Response status:', response.status);
      console.log('   - Full response structure:', JSON.stringify(response.data, null, 2));
      console.log('   - Prediction object keys:', Object.keys(response.data.prediction || {}));
      
      // Transform response back to standard format
      const result = dataTransformer.fromPythonFormat(response.data, aiModel);
      
      console.log('📊 [PYTHON ML] Prediction Result:');
      console.log('   - Expected Yield:', result.results.expectedYield);
      console.log('   - Confidence:', result.results.confidence + '%');
      console.log('   - Processing Time:', response.data.processingTime || responseTime, 'ms');
      console.log('='.repeat(60));
      
      return {
        results: result.results,
        recommendations: result.recommendations || [],
        governmentData: result.governmentData || {},
        modelInfo: {
          type: aiModel.type,
          name: aiModel.name,
          version: aiModel.version,
          processingTime: response.data.processingTime || responseTime
        }
      };

    } catch (error) {
      console.error('\n❌ [PYTHON ML] Prediction failed!');
      console.error('   Error:', error.message);
      console.error('   Service URL:', aiModel.configuration?.serviceUrl || this.pythonServiceUrl);
      console.error('   Will fallback to JavaScript engine');
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