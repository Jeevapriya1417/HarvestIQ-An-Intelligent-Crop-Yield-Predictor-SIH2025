// Real-time data management hooks and utilities
import { useState, useEffect, useCallback, useRef } from 'react';

// Hook for auto-refreshing data with configurable intervals
export const useAutoRefresh = (fetchFunction, interval = 30000, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async (showLoading = true) => {
    if (!mountedRef.current) return;
    
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      const result = await fetchFunction();
      
      if (!mountedRef.current) return;
      
      if (result.success) {
        setData(result.data);
        setLastUpdated(new Date());
      } else {
        setError(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err.message || 'Network error occurred');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchFunction]);

  // Start auto-refresh
  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) return;
    
    intervalRef.current = setInterval(() => {
      fetchData(false); // Don't show loading on auto-refresh
    }, interval);
  }, [fetchData, interval]);

  // Stop auto-refresh
  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Manual refresh
  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData(true);
    startAutoRefresh();

    return () => {
      mountedRef.current = false;
      stopAutoRefresh();
    };
  }, [fetchData, startAutoRefresh, stopAutoRefresh]);

  // Pause/resume on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAutoRefresh();
      } else {
        startAutoRefresh();
        // Refresh data when tab becomes visible
        fetchData(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [startAutoRefresh, stopAutoRefresh, fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    startAutoRefresh,
    stopAutoRefresh
  };
};

// Hook for real-time weather data
export const useWeatherData = (location = 'Punjab, India') => {
  const fetchWeather = useCallback(async () => {
    // Simulate weather API call with realistic data variations
    const baseWeather = {
      location,
      temperature: 28 + Math.floor(Math.random() * 8) - 4, // 24-32°C
      humidity: 60 + Math.floor(Math.random() * 20), // 60-80%
      rainfall: Math.floor(Math.random() * 20), // 0-20mm
      condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
      windSpeed: 5 + Math.floor(Math.random() * 15), // 5-20 km/h
      pressure: 1013 + Math.floor(Math.random() * 20) - 10, // 1003-1023 hPa
      uvIndex: Math.floor(Math.random() * 11), // 0-10
      visibility: 8 + Math.floor(Math.random() * 5) // 8-12 km
    };

    return {
      success: true,
      data: baseWeather
    };
  }, [location]);

  return useAutoRefresh(fetchWeather, 60000); // Refresh every minute
};

// Hook for real-time user statistics
export const useUserStats = (userId) => {
  const fetchStats = useCallback(async () => {
    try {
      // Simulate API call to get user stats
      const stats = {
        totalPredictions: 12 + Math.floor(Math.random() * 3),
        activeFields: 4,
        avgAccuracy: 92 + Math.floor(Math.random() * 6), // 92-98%
        thisMonth: 6 + Math.floor(Math.random() * 3),
        successRate: 94 + Math.floor(Math.random() * 4), // 94-98%
        totalYield: 45.6 + (Math.random() * 10), // tons
        bestCrop: ['Wheat', 'Rice', 'Sugarcane'][Math.floor(Math.random() * 3)]
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch user statistics'
      };
    }
  }, [userId]);

  return useAutoRefresh(fetchStats, 30000); // Refresh every 30 seconds
};

// Hook for real-time activity feed
export const useActivityFeed = (userId, limit = 5) => {
  const fetchActivities = useCallback(async () => {
    try {
      // Simulate fetching recent activities
      const activities = [
        {
          id: 1,
          action: 'Wheat yield prediction completed',
          timestamp: new Date(Date.now() - Math.random() * 3600000).toLocaleString(),
          type: 'prediction',
          status: 'completed',
          iconType: 'TrendingUp',
          color: 'text-green-600'
        },
        {
          id: 2,
          action: 'Field #3 soil data updated',
          timestamp: new Date(Date.now() - Math.random() * 86400000).toLocaleString(),
          type: 'field_update',
          status: 'updated',
          iconType: 'MapPin',
          color: 'text-blue-600'
        },
        {
          id: 3,
          action: 'Rice prediction analysis started',
          timestamp: new Date(Date.now() - Math.random() * 172800000).toLocaleString(),
          type: 'prediction',
          status: 'processing',
          iconType: 'BarChart3',
          color: 'text-orange-600'
        }
      ].slice(0, limit);

      return {
        success: true,
        data: activities
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch activity feed'
      };
    }
  }, [userId, limit]);

  return useAutoRefresh(fetchActivities, 45000); // Refresh every 45 seconds
};

// Hook for market price updates
export const useMarketPrices = () => {
  const fetchPrices = useCallback(async () => {
    try {
      const crops = ['Wheat', 'Rice', 'Sugarcane', 'Cotton', 'Maize'];
      const prices = crops.map(crop => ({
        crop,
        price: 2000 + Math.floor(Math.random() * 1500), // ₹2000-3500 per quintal
        change: (Math.random() - 0.5) * 200, // -100 to +100 change
        changePercent: (Math.random() - 0.5) * 10, // -5% to +5%
        lastUpdated: new Date()
      }));

      return {
        success: true,
        data: prices
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch market prices'
      };
    }
  }, []);

  return useAutoRefresh(fetchPrices, 120000); // Refresh every 2 minutes
};

// Hook for system health monitoring
export const useSystemHealth = () => {
  const fetchHealth = useCallback(async () => {
    try {
      const health = {
        status: Math.random() > 0.1 ? 'healthy' : 'warning', // 90% healthy
        uptime: '99.8%',
        responseTime: 120 + Math.floor(Math.random() * 80), // 120-200ms
        activeUsers: 1500 + Math.floor(Math.random() * 500),
        predictions: {
          total: 45000 + Math.floor(Math.random() * 1000),
          today: 150 + Math.floor(Math.random() * 50)
        },
        lastCheck: new Date()
      };

      return {
        success: true,
        data: health
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch system health'
      };
    }
  }, []);

  return useAutoRefresh(fetchHealth, 10000); // Refresh every 10 seconds
};

export default {
  useAutoRefresh,
  useWeatherData,
  useUserStats,
  useActivityFeed,
  useMarketPrices,
  useSystemHealth
};