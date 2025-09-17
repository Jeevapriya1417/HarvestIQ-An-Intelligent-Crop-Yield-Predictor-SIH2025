/**
 * Data Transformer Service
 * Handles data format conversion between frontend, backend, and AI models
 */

class DataTransformer {
  
  /**
   * Transform frontend input data to JavaScript prediction engine format
   * @param {Object} inputData - Raw input from frontend
   * @param {String} userId - User ID
   * @returns {Object} Transformed data for JavaScript engine
   */
  toJavaScriptFormat(inputData, userId) {
    return {
      cropType: inputData.cropType,
      farmArea: parseFloat(inputData.farmArea),
      region: inputData.region,
      farmerId: userId,
      
      // Soil data
      phLevel: inputData.soilData?.phLevel || null,
      organicContent: inputData.soilData?.organicContent || null,
      nitrogen: inputData.soilData?.nitrogen || null,
      phosphorus: inputData.soilData?.phosphorus || null,
      potassium: inputData.soilData?.potassium || null,
      
      // Weather data
      rainfall: inputData.weatherData?.rainfall || null,
      temperature: inputData.weatherData?.temperature || null,
      humidity: inputData.weatherData?.humidity || null,
      
      // Additional parameters
      ...inputData.additionalParams
    };
  }

  /**
   * Transform frontend input data to Python AI model format
   * @param {Object} inputData - Raw input from frontend
   * @param {Object} aiModel - AI model configuration
   * @param {String} userId - User ID
   * @returns {Object} Transformed data for Python model
   */
  toPythonFormat(inputData, aiModel, userId) {
    const baseData = {
      // Model metadata
      model_info: {
        name: aiModel.name,
        version: aiModel.version,
        type: aiModel.type
      },
      
      // User context
      user_id: userId,
      timestamp: new Date().toISOString(),
      
      // Agricultural data
      crop_data: {
        crop_type: inputData.cropType.toLowerCase(),
        farm_area_hectares: parseFloat(inputData.farmArea),
        region: inputData.region,
        planting_season: this.getCurrentSeason()
      },
      
      // Soil parameters
      soil_data: {
        ph_level: this.sanitizeNumeric(inputData.soilData?.phLevel),
        organic_content_percent: this.sanitizeNumeric(inputData.soilData?.organicContent),
        nitrogen_kg_per_ha: this.sanitizeNumeric(inputData.soilData?.nitrogen),
        phosphorus_kg_per_ha: this.sanitizeNumeric(inputData.soilData?.phosphorus),
        potassium_kg_per_ha: this.sanitizeNumeric(inputData.soilData?.potassium)
      },
      
      // Weather parameters
      weather_data: {
        annual_rainfall_mm: this.sanitizeNumeric(inputData.weatherData?.rainfall),
        average_temperature_celsius: this.sanitizeNumeric(inputData.weatherData?.temperature),
        humidity_percent: this.sanitizeNumeric(inputData.weatherData?.humidity)
      },
      
      // Model-specific parameters
      model_parameters: aiModel.configuration?.parameters || {},
      
      // Additional features for ML models
      features: this.extractMLFeatures(inputData)
    };

    return baseData;
  }

  /**
   * Transform Python AI model response to standard format
   * @param {Object} pythonResponse - Response from Python AI service
   * @param {Object} aiModel - AI model configuration
   * @returns {Object} Standardized prediction result
   */
  fromPythonFormat(pythonResponse, aiModel) {
    const prediction = pythonResponse.prediction || {};
    const metadata = pythonResponse.metadata || {};
    
    return {
      results: {
        expectedYield: this.sanitizeNumeric(prediction.expected_yield_tons_per_ha) || 0,
        yieldPerHectare: this.sanitizeNumeric(prediction.yield_per_hectare) || 0,
        totalYield: this.sanitizeNumeric(prediction.total_yield_tons) || 0,
        confidence: Math.round(this.sanitizeNumeric(prediction.confidence_score * 100)) || 85,
        factors: {
          model_version: metadata.model_version,
          feature_importance: prediction.feature_importance || {},
          processing_time_ms: metadata.processing_time_ms || 0,
          data_quality_score: prediction.data_quality_score || 1.0
        }
      },
      recommendations: this.transformRecommendations(pythonResponse.recommendations || []),
      governmentData: pythonResponse.government_data || {},
      modelMetadata: {
        accuracy_metrics: metadata.accuracy_metrics || {},
        model_performance: metadata.model_performance || {},
        prediction_uncertainty: prediction.uncertainty_bounds || {}
      }
    };
  }

  /**
   * Transform frontend input data to external API format
   * @param {Object} inputData - Raw input from frontend
   * @param {Object} aiModel - AI model configuration
   * @param {String} userId - User ID
   * @returns {Object} Transformed data for external API
   */
  toExternalAPIFormat(inputData, aiModel, userId) {
    const schema = aiModel.configuration?.inputSchema || {};
    
    // Use schema mapping if available, otherwise use default format
    if (schema.format === 'custom') {
      return this.applyCustomMapping(inputData, schema.mapping, userId);
    }
    
    // Default external API format
    return {
      apiVersion: "1.0",
      requestId: this.generateRequestId(),
      userId: userId,
      data: {
        agricultural: {
          cropType: inputData.cropType,
          areaInHectares: parseFloat(inputData.farmArea),
          region: inputData.region
        },
        environmental: {
          soil: {
            pH: inputData.soilData?.phLevel,
            organicMatter: inputData.soilData?.organicContent,
            nutrients: {
              N: inputData.soilData?.nitrogen,
              P: inputData.soilData?.phosphorus,
              K: inputData.soilData?.potassium
            }
          },
          climate: {
            precipitation: inputData.weatherData?.rainfall,
            temperature: inputData.weatherData?.temperature,
            humidity: inputData.weatherData?.humidity
          }
        }
      }
    };
  }

  /**
   * Transform external API response to standard format
   * @param {Object} apiResponse - Response from external API
   * @param {Object} aiModel - AI model configuration
   * @returns {Object} Standardized prediction result
   */
  fromExternalAPIFormat(apiResponse, aiModel) {
    const schema = aiModel.configuration?.outputSchema || {};
    
    if (schema.format === 'custom') {
      return this.parseCustomResponse(apiResponse, schema.mapping);
    }
    
    // Default external API response parsing
    const result = apiResponse.result || apiResponse.prediction || {};
    
    return {
      results: {
        expectedYield: this.sanitizeNumeric(result.yieldEstimate || result.expectedYield) || 0,
        yieldPerHectare: this.sanitizeNumeric(result.yieldPerHectare) || 0,
        totalYield: this.sanitizeNumeric(result.totalYield) || 0,
        confidence: Math.round(this.sanitizeNumeric(result.confidence)) || 85,
        factors: result.factors || {}
      },
      recommendations: this.transformRecommendations(result.recommendations || []),
      governmentData: result.externalData || {}
    };
  }

  /**
   * Extract machine learning features from input data
   * @param {Object} inputData - Raw input data
   * @returns {Object} Feature vector for ML models
   */
  extractMLFeatures(inputData) {
    const features = {};
    
    // Crop encoding (one-hot or label encoding)
    features.crop_encoding = this.encodeCropType(inputData.cropType);
    
    // Region encoding
    features.region_encoding = this.encodeRegion(inputData.region);
    
    // Soil feature engineering
    if (inputData.soilData) {
      features.soil_ph_category = this.categorizePH(inputData.soilData.phLevel);
      features.soil_fertility_index = this.calculateSoilFertilityIndex(inputData.soilData);
      features.npk_ratio = this.calculateNPKRatio(inputData.soilData);
    }
    
    // Weather feature engineering
    if (inputData.weatherData) {
      features.rainfall_category = this.categorizeRainfall(inputData.weatherData.rainfall);
      features.temperature_stress_index = this.calculateTemperatureStress(
        inputData.weatherData.temperature,
        inputData.cropType
      );
      features.humidity_index = this.categorizeHumidity(inputData.weatherData.humidity);
    }
    
    // Derived features
    features.farm_size_category = this.categorizeFarmSize(inputData.farmArea);
    features.growing_season = this.getCurrentSeason();
    features.feature_completeness = this.calculateFeatureCompleteness(inputData);
    
    return features;
  }

  /**
   * Transform recommendations to standard format
   * @param {Array} recommendations - Raw recommendations
   * @returns {Array} Standardized recommendations
   */
  transformRecommendations(recommendations) {
    return recommendations.map(rec => ({
      type: rec.type || rec.category || 'general',
      priority: rec.priority || rec.importance || 'medium',
      title: rec.title || rec.recommendation || 'Recommendation',
      description: rec.description || rec.details || rec.text || '',
      action: rec.action || rec.suggested_action || '',
      estimatedImpact: this.sanitizeNumeric(rec.impact || rec.estimated_improvement) || 0
    }));
  }

  // Utility methods
  
  sanitizeNumeric(value) {
    if (value === null || value === undefined || value === '') return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  }

  getCurrentSeason() {
    const month = new Date().getMonth() + 1;
    if (month >= 6 && month <= 10) return 'kharif';
    if (month >= 11 || month <= 3) return 'rabi';
    return 'zaid';
  }

  encodeCropType(cropType) {
    const cropMap = {
      'Wheat': 0, 'Rice': 1, 'Sugarcane': 2, 'Cotton': 3, 'Maize': 4,
      'Barley': 5, 'Mustard': 6, 'Potato': 7, 'Onion': 8, 'Tomato': 9
    };
    return cropMap[cropType] !== undefined ? cropMap[cropType] : -1;
  }

  encodeRegion(region) {
    const regionMap = {
      'Punjab': 0, 'Haryana': 1, 'Uttar Pradesh': 2, 'Rajasthan': 3, 'Gujarat': 4
    };
    return regionMap[region] !== undefined ? regionMap[region] : -1;
  }

  categorizePH(ph) {
    if (!ph) return 'unknown';
    if (ph < 6.0) return 'acidic';
    if (ph > 8.0) return 'alkaline';
    return 'neutral';
  }

  calculateSoilFertilityIndex(soilData) {
    if (!soilData) return 0;
    
    let score = 0;
    let factors = 0;
    
    // pH contribution
    if (soilData.phLevel) {
      const phScore = soilData.phLevel >= 6.0 && soilData.phLevel <= 8.0 ? 1 : 0.5;
      score += phScore;
      factors++;
    }
    
    // Organic content contribution
    if (soilData.organicContent) {
      const ocScore = soilData.organicContent >= 1.5 ? 1 : soilData.organicContent / 1.5;
      score += ocScore;
      factors++;
    }
    
    // NPK contribution
    if (soilData.nitrogen || soilData.phosphorus || soilData.potassium) {
      let npkScore = 0;
      let npkFactors = 0;
      
      if (soilData.nitrogen) {
        npkScore += soilData.nitrogen >= 200 ? 1 : soilData.nitrogen / 200;
        npkFactors++;
      }
      if (soilData.phosphorus) {
        npkScore += soilData.phosphorus >= 25 ? 1 : soilData.phosphorus / 25;
        npkFactors++;
      }
      if (soilData.potassium) {
        npkScore += soilData.potassium >= 200 ? 1 : soilData.potassium / 200;
        npkFactors++;
      }
      
      if (npkFactors > 0) {
        score += npkScore / npkFactors;
        factors++;
      }
    }
    
    return factors > 0 ? Math.round((score / factors) * 100) / 100 : 0;
  }

  calculateNPKRatio(soilData) {
    const n = soilData.nitrogen || 0;
    const p = soilData.phosphorus || 0;
    const k = soilData.potassium || 0;
    
    const total = n + p + k;
    if (total === 0) return { n: 0, p: 0, k: 0 };
    
    return {
      n: Math.round((n / total) * 100) / 100,
      p: Math.round((p / total) * 100) / 100,
      k: Math.round((k / total) * 100) / 100
    };
  }

  categorizeRainfall(rainfall) {
    if (!rainfall) return 'unknown';
    if (rainfall < 200) return 'low';
    if (rainfall < 600) return 'moderate';
    if (rainfall < 1000) return 'high';
    return 'very_high';
  }

  calculateTemperatureStress(temperature, cropType) {
    if (!temperature) return 0;
    
    const optimalRanges = {
      'Wheat': { min: 15, max: 25 },
      'Rice': { min: 20, max: 35 },
      'Sugarcane': { min: 25, max: 35 },
      'Cotton': { min: 21, max: 35 },
      'Maize': { min: 20, max: 30 }
    };
    
    const range = optimalRanges[cropType] || { min: 15, max: 35 };
    
    if (temperature >= range.min && temperature <= range.max) return 0;
    if (temperature < range.min) return (range.min - temperature) / range.min;
    return (temperature - range.max) / range.max;
  }

  categorizeHumidity(humidity) {
    if (!humidity) return 'unknown';
    if (humidity < 40) return 'low';
    if (humidity < 70) return 'moderate';
    return 'high';
  }

  categorizeFarmSize(area) {
    if (!area) return 'unknown';
    if (area < 1) return 'small';
    if (area < 5) return 'medium';
    return 'large';
  }

  calculateFeatureCompleteness(inputData) {
    let total = 0;
    let present = 0;
    
    // Essential fields
    const essentialFields = ['cropType', 'farmArea', 'region'];
    essentialFields.forEach(field => {
      total++;
      if (inputData[field]) present++;
    });
    
    // Soil data fields
    const soilFields = ['phLevel', 'organicContent', 'nitrogen', 'phosphorus', 'potassium'];
    soilFields.forEach(field => {
      total++;
      if (inputData.soilData?.[field]) present++;
    });
    
    // Weather data fields
    const weatherFields = ['rainfall', 'temperature', 'humidity'];
    weatherFields.forEach(field => {
      total++;
      if (inputData.weatherData?.[field]) present++;
    });
    
    return Math.round((present / total) * 100) / 100;
  }

  applyCustomMapping(inputData, mapping, userId) {
    // Apply custom field mapping based on external API requirements
    const result = {};
    
    Object.keys(mapping).forEach(key => {
      const sourcePath = mapping[key];
      result[key] = this.getNestedValue(inputData, sourcePath);
    });
    
    result.userId = userId;
    return result;
  }

  parseCustomResponse(response, mapping) {
    // Parse custom response format based on schema mapping
    const result = {
      results: {},
      recommendations: [],
      governmentData: {}
    };
    
    Object.keys(mapping).forEach(targetField => {
      const sourcePath = mapping[targetField];
      const value = this.getNestedValue(response, sourcePath);
      this.setNestedValue(result, targetField, value);
    });
    
    return result;
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const dataTransformer = new DataTransformer();
export default dataTransformer;