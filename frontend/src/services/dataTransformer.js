// dataTransformer.js
export const toPythonFormat = (inputData, userId) => {
  return {
    // Model metadata
    model_info: {
      name: 'Crop Yield Predictor',
      version: '1.0',
      type: 'python-ml'
    },
    
    // User context
    user_id: userId,
    timestamp: new Date().toISOString(),
    
    // Agricultural data
    crop_data: {
      crop_type: inputData.cropType.toLowerCase(),
      farm_area_hectares: parseFloat(inputData.farmArea),
      region: inputData.region,
      planting_season: inputData.season
    },
    
    // Soil parameters
    soil_data: {
      ph_level: inputData.soilData?.phLevel,
      organic_content_percent: inputData.soilData?.organicContent,
      nitrogen_kg_per_ha: inputData.soilData?.nitrogen,
      phosphorus_kg_per_ha: inputData.soilData?.phosphorus,
      potassium_kg_per_ha: inputData.soilData?.potassium
    },
    
    // Weather parameters
    weather_data: {
      annual_rainfall_mm: inputData.weatherData?.rainfall
    }
  };
};

export const fromPythonFormat = (pythonResponse) => {
  return {
    expectedYield: pythonResponse.data.prediction.expectedYield,
    yieldPerHectare: pythonResponse.data.prediction.expectedYield,
    totalYield: (pythonResponse.data.prediction.expectedYield * pythonResponse.data.inputData.crop_data.farm_area_hectares).toFixed(2),
    confidence: pythonResponse.data.confidence
  };
};