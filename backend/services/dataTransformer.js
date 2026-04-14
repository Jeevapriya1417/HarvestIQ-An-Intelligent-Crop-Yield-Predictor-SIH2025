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
    // Helper function to clip values to training data ranges
    const clipToTrainingRange = (value, min, max, defaultVal) => {
      const num = this.sanitizeNumeric(value);
      if (num === null) return defaultVal;
      return Math.max(min, Math.min(max, num));
    };

    // Python FastAPI expects flat structure with nested soil_data and weather_data
    const baseData = {
      // Top-level fields (flat)
      crop_type: this.mapCropTypeToSupported(inputData.cropType),
      farm_area_hectares: parseFloat(inputData.farmArea) || 1,
      region: this.mapRegionToTrainingState(inputData.region),
      planting_season: this.getCurrentSeason(),
      
      // User context
      user_id: userId,
      timestamp: new Date().toISOString(),
      
      // Soil parameters (nested as soil_data)
      soil_data: {
        ph_level: clipToTrainingRange(
          inputData.phLevel || inputData.soilData?.phLevel, 
          4.0, 9.0, 6.5
        ),
        organic_content_percent: (() => {
          // CRITICAL FIX: Convert from user's 0-100% scale to training data scale (0.1-2.5%)
          const value = this.sanitizeNumeric(inputData.organicContent || inputData.soilData?.organicContent);
          if (value === null) return 1.5;
          // If value > 10, assume user entered 0-100 scale, convert to 0-2.5 range
          if (value > 10) {
            return clipToTrainingRange((value / 100) * 2.5, 0.1, 2.5, 1.5);
          }
          // Otherwise use as-is (already in correct scale)
          return clipToTrainingRange(value, 0.1, 2.5, 1.5);
        })(),
        nitrogen_kg_per_ha: clipToTrainingRange(
          inputData.nitrogen || inputData.soilData?.nitrogen, 
          10, 200, 100
        ),
        phosphorus_kg_per_ha: clipToTrainingRange(
          inputData.phosphorus || inputData.soilData?.phosphorus, 
          10, 80, 40
        ),
        potassium_kg_per_ha: clipToTrainingRange(
          inputData.potassium || inputData.soilData?.potassium, 
          10, 90, 50
        )
      },
      
      // Weather parameters (nested as weather_data)
      weather_data: {
        annual_rainfall_mm: clipToTrainingRange(
          inputData.rainfall || inputData.weatherData?.rainfall, 
          200, 2500, 1000
        ),
        average_temperature_celsius: clipToTrainingRange(
          inputData.temperature || inputData.weatherData?.temperature, 
          10, 45, 25
        ),
        humidity_percent: clipToTrainingRange(
          inputData.humidity || inputData.weatherData?.humidity, 
          20, 95, 60
        )
      },
      
      // Model-specific parameters
      model_parameters: aiModel.configuration?.parameters || {}
    };

    console.log('\n🔄 [TRANSFORMER] Python format data:');
    console.log('   - Crop:', baseData.crop_type);
    console.log('   - Farm Area:', baseData.farm_area_hectares, 'hectares');
    console.log('   - Region:', baseData.region);
    console.log('   - Soil pH:', baseData.soil_data.ph_level, '(range: 4.0-9.0)');
    console.log('   - Organic Content:', baseData.soil_data.organic_content_percent, '% (range: 0.1-2.5, training: 0.5-1.5)');
    console.log('   - Nitrogen:', baseData.soil_data.nitrogen_kg_per_ha, 'kg/ha (range: 10-200)');
    console.log('   - Phosphorus:', baseData.soil_data.phosphorus_kg_per_ha, 'kg/ha (range: 10-80)');
    console.log('   - Potassium:', baseData.soil_data.potassium_kg_per_ha, 'kg/ha (range: 10-90)');
    console.log('   - Rainfall:', baseData.weather_data.annual_rainfall_mm, 'mm (range: 200-2500)');
    console.log('   - Temperature:', baseData.weather_data.average_temperature_celsius, '°C (range: 10-45)');
    console.log('   - Humidity:', baseData.weather_data.humidity_percent, '% (range: 20-95)');

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
    
    console.log('\n📥 [TRANSFORMER] Raw Python response structure:');
    console.log('   - Response keys:', Object.keys(pythonResponse));
    console.log('   - Prediction keys:', Object.keys(prediction));
    console.log('   - Full prediction object:', JSON.stringify(prediction, null, 2));
    
    // CRITICAL FIX: Match Python's actual response field names
    // Python returns: expected_yield, yield_per_hectare, total_yield, confidence
    const expectedYield = this.sanitizeNumeric(
      prediction.expected_yield ||              // ✅ Python FastAPI returns this
      prediction.expected_yield_tons_per_ha ||  // Fallback for old format
      prediction.yield_per_hectare ||           // Fallback
      prediction.expectedYield ||               // Fallback for camelCase
      pythonResponse.expected_yield ||          // Fallback at root level
      0
    );
    
    const yieldPerHectare = this.sanitizeNumeric(
      prediction.yield_per_hectare ||           // ✅ Python FastAPI returns this
      expectedYield ||                          // Fallback to expected_yield
      0
    );
    
    const totalYield = this.sanitizeNumeric(
      prediction.total_yield ||                 // ✅ Python FastAPI returns this
      prediction.total_yield_tons ||            // Fallback for old format
      prediction.totalYield ||                  // Fallback for camelCase
      pythonResponse.total_yield ||             // Fallback at root level
      (expectedYield * (pythonResponse.farm_area_hectares || 1)) ||  // Calculate if missing
      0
    );
    
    const confidence = Math.round(
      this.sanitizeNumeric(prediction.confidence) ||       // ✅ Python FastAPI returns this
      this.sanitizeNumeric(prediction.confidence_score * 100) ||  // Fallback (0-1 scale)
      this.sanitizeNumeric(pythonResponse.confidence) ||   // Fallback at root level
      85
    );
    
    console.log('\n📊 [TRANSFORMER] Python response mapping:');
    console.log('   - Expected Yield:', expectedYield, 'tons/ha');
    console.log('   - Yield Per Hectare:', yieldPerHectare, 'tons/ha');
    console.log('   - Total Yield:', totalYield, 'tons');
    console.log('   - Confidence:', confidence + '%');
    console.log('   - Unit:', prediction.unit || 'kg/ha');
    
    return {
      results: {
        expectedYield: expectedYield || 0,
        yieldPerHectare: yieldPerHectare || 0,
        totalYield: totalYield || 0,
        confidence: confidence,
        factors: {
          model_version: metadata.model_version || aiModel?.version || '1.0.0',
          feature_importance: prediction.feature_importance || {},
          processing_time_ms: metadata.processing_time_ms || 0,
          data_quality_score: prediction.data_quality_score || 1.0
        }
      },
      recommendations: this.transformRecommendations(pythonResponse.recommendations || []),
      governmentData: pythonResponse.government_data || {},
      modelMetadata: {
        accuracy_metrics: metadata.accuracy_metrics || pythonResponse.model_info?.metrics || {},
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
    
    // Soil feature engineering (support both flat and nested structure)
    const soilData = inputData.soilData || {
      phLevel: inputData.phLevel,
      organicContent: inputData.organicContent,
      nitrogen: inputData.nitrogen,
      phosphorus: inputData.phosphorus,
      potassium: inputData.potassium
    };
    
    if (soilData) {
      features.soil_ph_category = this.categorizePH(soilData.phLevel);
      features.soil_fertility_index = this.calculateSoilFertilityIndex(soilData);
      features.npk_ratio = this.calculateNPKRatio(soilData);
    }
    
    // Weather feature engineering (support both flat and nested structure)
    const weatherData = inputData.weatherData || {
      rainfall: inputData.rainfall,
      temperature: inputData.temperature,
      humidity: inputData.humidity
    };
    
    if (weatherData) {
      features.rainfall_category = this.categorizeRainfall(weatherData.rainfall);
      features.temperature_stress_index = this.calculateTemperatureStress(
        weatherData.temperature,
        inputData.cropType
      );
      features.humidity_index = this.categorizeHumidity(weatherData.humidity);
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
    // Kharif: June-October (monsoon crops)
    if (month >= 6 && month <= 10) return 'Kharif';
    // Rabi: November-March (winter crops)
    if (month >= 11 || month <= 3) return 'Rabi';
    // Summer: April-May (summer crops)
    return 'Summer';
  }

  mapRegionToTrainingState(userRegion) {
    const knownStates = ['Punjab', 'Haryana', 'Uttar Pradesh', 'Maharashtra', 'Karnataka'];
    if (!userRegion) return 'Punjab';
    if (knownStates.includes(userRegion)) return userRegion;
    const regionMap = {
      'Rajasthan': 'Haryana',
      'Gujarat': 'Maharashtra',
      'Gujrat': 'Maharashtra',
      'Madhya Pradesh': 'Maharashtra',
      'Chhattisgarh': 'Maharashtra',
      'Andhra Pradesh': 'Karnataka',
      'Telangana': 'Karnataka',
      'Bihar': 'Uttar Pradesh',
      'Jharkhand': 'Uttar Pradesh',
      'West Bengal': 'Haryana',
      'Assam': 'Haryana',
      'Himachal Pradesh': 'Haryana',
      'Uttarakhand': 'Uttar Pradesh',
      'Tamil Nadu': 'Karnataka',
      'Kerala': 'Karnataka',
      'Odisha': 'Haryana',
      'Tripura': 'Haryana',
      'Nagaland': 'Haryana',
      'Manipur': 'Haryana',
      'Mizoram': 'Haryana',
      'Arunachal Pradesh': 'Haryana',
      'Sikkim': 'Haryana',
      'Meghalaya': 'Haryana'
    };
    const mapped = regionMap[userRegion];
    if (mapped) return mapped;
    for (const [key, value] of Object.entries(regionMap)) {
      if (key.toLowerCase() === userRegion?.toLowerCase()) return value;
    }
    console.warn(`⚠️ [DATA TRANSFORMER] Unknown region '${userRegion}', defaulting to 'Punjab'`);
    return 'Punjab';
  }

  /**
   * Map user-provided crop type to Python training data supported crops
   * Python service trained only on: Wheat, Rice, Sugarcane, Cotton, Maize, Barley
   */
  mapCropTypeToSupported(userCrop) {
    const supportedCrops = ['Wheat', 'Rice', 'Sugarcane', 'Cotton', 'Maize', 'Barley'];
    
    if (!userCrop) return 'Wheat'; // Default
    
    // Exact match (titlecase)
    if (supportedCrops.includes(userCrop)) {
      return userCrop;
    }
    
    // Case-insensitive exact match
    for (const crop of supportedCrops) {
      if (crop.toLowerCase() === userCrop.toLowerCase()) {
        return crop;
      }
    }
    
    // Fuzzy mapping for common crops not in training data
    const cropMap = {
      // Cereals/Grains
      'Barley': 'Barley',
      'Oats': 'Wheat',
      'Sorghum': 'Wheat',
      'Millet': 'Wheat',
      'Rye': 'Wheat',
      'Flour': 'Wheat',
      'Grain': 'Wheat',
      
      // Rice variants
      'Rice': 'Rice',
      'Paddy': 'Rice',
      'Jasmine': 'Rice',
      'Basmati': 'Rice',
      
      // Sugarcane variants
      'Sugarcane': 'Sugarcane',
      'Sugar': 'Sugarcane',
      
      // Cotton variants
      'Cotton': 'Cotton',
      'Wool': 'Cotton',
      
      // Maize variants
      'Maize': 'Maize',
      'Corn': 'Maize',
      'Maiz': 'Maize',
      
      // Wheat variants
      'Wheat': 'Wheat',
      'Durum': 'Wheat',
      'Spelt': 'Wheat',
      
      // Other crops mapped to similar ones
      'Banana': 'Sugarcane',      // Tropical crop, similar climate
      'Plantain': 'Sugarcane',    // Similar to banana
      'Mango': 'Sugarcane',       // Tropical
      'Coconut': 'Sugarcane',     // Tropical
      'Cocoa': 'Cotton',          // Cash crop, similar profile
      'Tea': 'Cotton',            // Plantation crop
      'Coffee': 'Cotton',         // Plantation crop
      'Groundnut': 'Cotton',      // Cash crop
      'Soybean': 'Maize',         // Summer crop
      'Sunflower': 'Maize',       // Summer crop
      'Mustard': 'Wheat',         // Rabi crop
      'Potato': 'Wheat',          // Rabi/kharif
      'Onion': 'Wheat',           // Vegetable, similar season
      'Tomato': 'Cotton',         // Summer crop
      'Chilli': 'Cotton',         // Summer cash crop
      'Turmeric': 'Cotton',       // Summer crop
      'Ginger': 'Cotton',         // Summer crop
      'Cardamom': 'Cotton',       // Plantation
      'Black Pepper': 'Cotton',   // Plantation\n      'Clove': 'Cotton',          // Plantation
      'Nutmeg': 'Cotton',         // Plantation
      'Cinnamon': 'Cotton',       // Plantation
      'Apple': 'Wheat',           // Temperate
      'Pear': 'Wheat',            // Temperate
      'Peach': 'Wheat',           // Temperate
      'Grapes': 'Sugarcane',      // Summer crop
      'Orange': 'Sugarcane',      // Citrus, tropical
      'Lemon': 'Sugarcane',       // Citrus
      'Lime': 'Sugarcane',        // Citrus
      'Pomegranate': 'Sugarcane', // Semi-arid
      'Guava': 'Sugarcane',       // Tropical
      'Papaya': 'Sugarcane',      // Tropical
      'Pineapple': 'Sugarcane',   // Tropical
      'Watermelon': 'Maize',      // Summer
      'Melon': 'Maize',           // Summer
      'Cucumber': 'Maize',        // Summer
      'Pumpkin': 'Maize',         // Summer
      'Squash': 'Maize',          // Summer
      'Cabbage': 'Wheat',         // Rabi
      'Cauliflower': 'Wheat',     // Rabi
      'Broccoli': 'Wheat',        // Rabi
      'Carrot': 'Wheat',          // Rabi
      'Radish': 'Wheat',          // Rabi
      'Spinach': 'Wheat',         // Rabi
      'Lettuce': 'Wheat',         // Cool season
      'Peas': 'Wheat',            // Rabi
      'Beans': 'Maize',           // Summer
      'Lentil': 'Wheat',          // Rabi
      'Chickpea': 'Wheat',        // Rabi
      'Arhar': 'Maize',           // Summer
      'Gram': 'Wheat'             // Rabi
    };
    
    // Try direct mapping
    const mapped = cropMap[userCrop];
    if (mapped) {
      console.log(`ℹ️ [DATA TRANSFORMER] Mapped crop '${userCrop}' → '${mapped}' (training data available)`);
      return mapped;
    }
    
    // Try case-insensitive mapping
    for (const [key, value] of Object.entries(cropMap)) {
      if (key.toLowerCase() === userCrop.toLowerCase()) {
        console.log(`ℹ️ [DATA TRANSFORMER] Mapped crop '${userCrop}' → '${value}' (case-insensitive)`);
        return value;
      }
    }
    
    // Final fallback
    console.warn(`⚠️ [DATA TRANSFORMER] Unknown crop '${userCrop}', defaulting to 'Wheat'`);
    return 'Wheat';
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