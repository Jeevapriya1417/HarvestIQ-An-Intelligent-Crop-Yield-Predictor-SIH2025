// Government Data Integration Service
// This service integrates with various Indian government agricultural APIs

export class GovernmentDataService {
  constructor() {
    this.baseUrls = {
      meteorology: 'https://api.imd.gov.in', // India Meteorological Department
      agriculture: 'https://api.data.gov.in', // Government Open Data Platform
      soilHealth: 'https://soilhealth.dac.gov.in/api', // Soil Health Card API
      market: 'https://api.agmarknet.gov.in' // Agricultural Marketing Division
    };
  }

  // Fetch weather data from IMD
  async getWeatherData(region, coordinates) {
    try {
      // Mock implementation - replace with actual API calls
      const mockWeatherData = {
        location: region,
        temperature: Math.round(15 + Math.random() * 20),
        humidity: Math.round(40 + Math.random() * 40),
        rainfall: Math.round(Math.random() * 100),
        windSpeed: Math.round(Math.random() * 20),
        pressure: Math.round(1000 + Math.random() * 50),
        condition: ['Clear', 'Partly Cloudy', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 4)],
        forecast: this.generateForecast()
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockWeatherData;
    } catch (error) {
      console.error('Weather data fetch error:', error);
      return this.getFallbackWeatherData(region);
    }
  }

  // Fetch soil health data from Soil Health Card database
  async getSoilHealthData(region, farmerId) {
    try {
      const mockSoilData = {
        farmerId,
        region,
        lastTested: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
        pH: (6.0 + Math.random() * 2).toFixed(1),
        organicCarbon: (1.0 + Math.random() * 2).toFixed(1),
        nitrogen: Math.round(200 + Math.random() * 300),
        phosphorus: Math.round(10 + Math.random() * 40),
        potassium: Math.round(100 + Math.random() * 200),
        sulfur: Math.round(5 + Math.random() * 15),
        zinc: (0.5 + Math.random() * 1.5).toFixed(1),
        iron: Math.round(5 + Math.random() * 15),
        manganese: Math.round(1 + Math.random() * 5),
        recommendations: this.generateSoilRecommendations()
      };

      await new Promise(resolve => setTimeout(resolve, 800));
      return mockSoilData;
    } catch (error) {
      console.error('Soil health data fetch error:', error);
      return null;
    }
  }

  // Fetch historical crop yield data
  async getHistoricalYieldData(cropType, region, years = 5) {
    try {
      const currentYear = new Date().getFullYear();
      const mockHistoricalData = [];
      
      for (let i = 0; i < years; i++) {
        const year = currentYear - i;
        const baseYield = this.getBaseYieldForCrop(cropType);
        const variation = 0.8 + Math.random() * 0.4; // 20% variation
        
        mockHistoricalData.push({
          year,
          crop: cropType,
          region,
          yield: (baseYield * variation).toFixed(2),
          area: Math.round(50000 + Math.random() * 100000), // hectares
          production: Math.round(baseYield * variation * (50000 + Math.random() * 100000)),
          productivity: (baseYield * variation).toFixed(2)
        });
      }

      await new Promise(resolve => setTimeout(resolve, 600));
      return mockHistoricalData.sort((a, b) => b.year - a.year);
    } catch (error) {
      console.error('Historical yield data fetch error:', error);
      return [];
    }
  }

  // Fetch market prices from AgMarkNet
  async getMarketPrices(cropType, region) {
    try {
      const basePrice = this.getBasePriceForCrop(cropType);
      const variation = 0.85 + Math.random() * 0.3;
      
      const mockMarketData = {
        crop: cropType,
        region,
        currentPrice: Math.round(basePrice * variation),
        previousPrice: Math.round(basePrice * (variation - 0.05 + Math.random() * 0.1)),
        priceUnit: 'per quintal',
        marketDate: new Date().toISOString().split('T')[0],
        trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
        markets: this.generateMarketList(region),
        forecast: this.generatePriceForecast(basePrice, variation)
      };

      await new Promise(resolve => setTimeout(resolve, 400));
      return mockMarketData;
    } catch (error) {
      console.error('Market price fetch error:', error);
      return null;
    }
  }

  // Fetch agricultural schemes and subsidies
  async getGovernmentSchemes(region, cropType) {
    try {
      const mockSchemes = [
        {
          id: 'pm-kisan',
          name: 'PM-KISAN Scheme',
          description: 'Direct income support to farmers',
          eligibility: 'All landholding farmers',
          benefit: '₹6000 per year',
          applicationUrl: 'https://pmkisan.gov.in',
          status: 'active'
        },
        {
          id: 'fasal-bima',
          name: 'Pradhan Mantri Fasal Bima Yojana',
          description: 'Crop insurance scheme',
          eligibility: 'All farmers growing notified crops',
          benefit: 'Insurance coverage up to sum insured',
          applicationUrl: 'https://pmfby.gov.in',
          status: 'active'
        },
        {
          id: 'kcc',
          name: 'Kisan Credit Card',
          description: 'Credit facility for farmers',
          eligibility: 'Farmers with land records',
          benefit: 'Low interest agricultural loans',
          applicationUrl: 'https://kcc.gov.in',
          status: 'active'
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 300));
      return mockSchemes;
    } catch (error) {
      console.error('Government schemes fetch error:', error);
      return [];
    }
  }

  // Helper methods
  generateForecast() {
    return Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      temperature: Math.round(15 + Math.random() * 20),
      condition: ['Clear', 'Partly Cloudy', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 4)],
      rainfall: Math.round(Math.random() * 20)
    }));
  }

  generateSoilRecommendations() {
    const recommendations = [
      'Apply lime to increase soil pH if below 6.0',
      'Add organic matter like compost or farmyard manure',
      'Use balanced NPK fertilizers based on soil test results',
      'Consider crop rotation to improve soil health',
      'Implement proper drainage system if needed'
    ];
    
    return recommendations.slice(0, Math.floor(Math.random() * 3) + 2);
  }

  getBaseYieldForCrop(cropType) {
    const baseYields = {
      'Wheat': 4.5,
      'Rice': 6.2,
      'Sugarcane': 75,
      'Cotton': 2.8,
      'Maize': 5.4,
      'Barley': 3.8,
      'Mustard': 1.2,
      'Potato': 25,
      'Onion': 20,
      'Tomato': 35
    };
    return baseYields[cropType] || 3.0;
  }

  getBasePriceForCrop(cropType) {
    const basePrices = {
      'Wheat': 2000,
      'Rice': 1940,
      'Sugarcane': 315,
      'Cotton': 6000,
      'Maize': 1850,
      'Barley': 1735,
      'Mustard': 5450,
      'Potato': 1200,
      'Onion': 1500,
      'Tomato': 2500
    };
    return basePrices[cropType] || 2000;
  }

  generateMarketList(region) {
    const markets = {
      'Punjab': ['Ludhiana Mandi', 'Amritsar Mandi', 'Jalandhar Mandi'],
      'Haryana': ['Karnal Mandi', 'Kurukshetra Mandi', 'Panipat Mandi'],
      'Uttar Pradesh': ['Meerut Mandi', 'Agra Mandi', 'Lucknow Mandi'],
      'Rajasthan': ['Jaipur Mandi', 'Kota Mandi', 'Udaipur Mandi']
    };
    return markets[region] || ['Local Mandi', 'District Mandi', 'State Mandi'];
  }

  generatePriceForecast(basePrice, currentVariation) {
    return Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: Math.round(basePrice * (currentVariation + (Math.random() - 0.5) * 0.1))
    }));
  }

  getFallbackWeatherData(region) {
    return {
      location: region,
      temperature: 25,
      humidity: 65,
      rainfall: 0,
      condition: 'Data Unavailable',
      message: 'Unable to fetch real-time weather data. Using fallback values.'
    };
  }
}

export default new GovernmentDataService();