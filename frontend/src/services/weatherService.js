import axios from 'axios';

// WeatherAPI service for fetching real-time weather data
const WEATHER_API_KEY = '3b18ad457601420a8a6134821252509';
const WEATHER_API_BASE_URL = 'https://api.weatherapi.com/v1';

// Create axios instance for WeatherAPI
const weatherAPI = axios.create({
  baseURL: WEATHER_API_BASE_URL,
  timeout: 10000,
  params: {
    key: WEATHER_API_KEY
  }
});

/**
 * Fetch current weather data for a location
 * @param {string} location - Location name (city, region, etc.)
 * @param {boolean} includeAQI - Whether to include air quality data
 * @returns {Promise<Object>} Weather data response
 */
export const getCurrentWeather = async (location, includeAQI = true) => {
  try {
    const response = await weatherAPI.get('/current.json', {
      params: {
        q: location,
        aqi: includeAQI ? 'yes' : 'no'
      }
    });
    
    return {
      success: true,
      data: response.data,
      location: location
    };
  } catch (error) {
    console.error('Weather API error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || 'Failed to fetch weather data',
      status: error.response?.status || 500
    };
  }
};

/**
 * Fetch weather forecast for a location
 * @param {string} location - Location name
 * @param {number} days - Number of days for forecast (1-10)
 * @param {boolean} includeAQI - Whether to include air quality data
 * @returns {Promise<Object>} Forecast data response
 */
export const getWeatherForecast = async (location, days = 3, includeAQI = true) => {
  try {
    const response = await weatherAPI.get('/forecast.json', {
      params: {
        q: location,
        days: days,
        aqi: includeAQI ? 'yes' : 'no'
      }
    });
    
    return {
      success: true,
      data: response.data,
      location: location
    };
  } catch (error) {
    console.error('Weather Forecast API error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || 'Failed to fetch weather forecast',
      status: error.response?.status || 500
    };
  }
};

/**
 * Transform weather data for agricultural use
 * @param {Object} weatherData - Raw weather data from API
 * @returns {Object} Transformed data for agricultural applications
 */
export const transformWeatherData = (weatherData) => {
  if (!weatherData || !weatherData.current) {
    return null;
  }
  
  const { current, location } = weatherData;
  
  return {
    // Temperature data
    temperature: current.temp_c,
    feelsLike: current.feelslike_c,
    tempFahrenheit: current.temp_f,
    
    // Weather conditions
    condition: current.condition.text,
    conditionCode: current.condition.code,
    isDay: current.is_day === 1,
    
    // Precipitation
    precipitationMM: current.precip_mm,
    precipitationInches: current.precip_in,
    humidity: current.humidity,
    cloudCover: current.cloud,
    
    // Wind data
    windSpeedKph: current.wind_kph,
    windSpeedMph: current.wind_mph,
    windDirection: current.wind_dir,
    windDegree: current.wind_degree,
    
    // Atmospheric data
    pressureMB: current.pressure_mb,
    pressureIn: current.pressure_in,
    visibilityKM: current.vis_km,
    visibilityMiles: current.vis_miles,
    uvIndex: current.uv,
    
    // Air quality (if available)
    airQuality: current.air_quality ? {
      co: current.air_quality.co,
      no2: current.air_quality.no2,
      o3: current.air_quality.o3,
      so2: current.air_quality.so2,
      pm2_5: current.air_quality.pm2_5,
      pm10: current.air_quality.pm10,
      usEpaIndex: current.air_quality['us-epa-index'],
      gbDefraIndex: current.air_quality['gb-defra-index']
    } : null,
    
    // Location info
    location: {
      name: location.name,
      region: location.region,
      country: location.country,
      lat: location.lat,
      lon: location.lon,
      timezone: location.tz_id,
      localtime: location.localtime
    },
    
    // Timestamp
    lastUpdated: current.last_updated,
    lastUpdatedEpoch: current.last_updated_epoch
  };
};

/**
 * Get simplified weather data for form inputs
 * @param {string} location - Location name
 * @returns {Promise<Object>} Simplified weather data for agricultural forms
 */
export const getAgriculturalWeatherData = async (location) => {
  const result = await getCurrentWeather(location);
  
  if (!result.success) {
    return result;
  }
  
  const transformedData = transformWeatherData(result.data);
  
  if (!transformedData) {
    return {
      success: false,
      error: 'Failed to transform weather data'
    };
  }
  
  // Extract key agricultural weather metrics
  return {
    success: true,
    data: {
      temperature: transformedData.temperature,
      humidity: transformedData.humidity,
      precipitation: transformedData.precipitationMM,
      condition: transformedData.condition,
      windSpeed: transformedData.windSpeedKph,
      pressure: transformedData.pressureMB,
      uvIndex: transformedData.uvIndex
    },
    location: transformedData.location
  };
};

export default {
  getCurrentWeather,
  getWeatherForecast,
  transformWeatherData,
  getAgriculturalWeatherData
};