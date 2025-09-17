import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  FileText, 
  Settings, 
  TrendingUp, 
  Leaf, 
  MapPin,
  Calendar,
  BarChart3,
  Cloud,
  Droplets,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Navbar from './Navbar';
import { CardSkeleton } from './ui';
import { useWeatherData, useUserStats, useActivityFeed } from '../hooks/useRealTimeData';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, predictions } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [animationDelay, setAnimationDelay] = useState(0);
  
  // Real-time data hooks
  const { 
    data: weatherData, 
    loading: weatherLoading, 
    error: weatherError, 
    lastUpdated: weatherLastUpdated,
    refresh: refreshWeather 
  } = useWeatherData();
  
  const { 
    data: userStats, 
    loading: statsLoading, 
    error: statsError,
    lastUpdated: statsLastUpdated,
    refresh: refreshStats 
  } = useUserStats(user?.id);
  
  const { 
    data: activities, 
    loading: activitiesLoading, 
    error: activitiesError,
    lastUpdated: activitiesLastUpdated,
    refresh: refreshActivities 
  } = useActivityFeed(user?.id);

  // Simulate loading and stagger animations
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Create animated delay for staggered animations
  const getAnimationDelay = (index) => {
    return `${index * 100}ms`;
  };

  // Refresh all data
  const refreshAllData = () => {
    refreshWeather();
    refreshStats();
    refreshActivities();
  };

  const quickActions = [
    {
      title: t('dashboard.newPrediction'),
      description: 'Start a new crop yield prediction',
      icon: PlusCircle,
      onClick: () => navigate('/prediction'),
      gradient: 'from-green-500 to-green-600',
      color: 'text-green-600'
    },
    {
      title: t('dashboard.viewReports'),
      description: 'View your prediction history',
      icon: FileText,
      onClick: () => navigate('/reports'),
      gradient: 'from-blue-500 to-blue-600',
      color: 'text-blue-600'
    },
    {
      title: t('dashboard.manageFields'),
      description: 'Manage your field information',
      icon: MapPin,
      onClick: () => navigate('/fields'),
      gradient: 'from-purple-500 to-purple-600',
      color: 'text-purple-600'
    },
    {
      title: 'Analytics Dashboard',
      description: 'View detailed analytics',
      icon: BarChart3,
      onClick: () => navigate('/analytics'),
      gradient: 'from-orange-500 to-orange-600',
      color: 'text-orange-600'
    }
  ];

  // Use real-time stats or fallback to static data
  const stats = userStats ? [
    {
      title: 'Total Predictions',
      value: userStats.totalPredictions.toString(),
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'Active Fields',
      value: userStats.activeFields.toString(),
      icon: MapPin,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Avg. Accuracy',
      value: `${userStats.avgAccuracy}%`,
      icon: BarChart3,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      title: 'This Month',
      value: userStats.thisMonth.toString(),
      icon: Calendar,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ] : [
    {
      title: 'Total Predictions',
      value: predictions.length.toString(),
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'Active Fields',
      value: '4',
      icon: MapPin,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Avg. Accuracy',
      value: '94%',
      icon: BarChart3,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      title: 'This Month',
      value: '6',
      icon: Calendar,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8 animate-fade-in-down">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2 animate-slide-up">
                Welcome back, {user?.name || 'User'}! 👋
              </h1>
              <p className="text-lg text-gray-600 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                {t('dashboard.subtitle')}
              </p>
            </div>
            
            {/* Real-time Status & Refresh */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {weatherError || statsError || activitiesError ? (
                  <WifiOff className="h-4 w-4 text-red-500" />
                ) : (
                  <Wifi className="h-4 w-4 text-green-500 animate-pulse" />
                )}
                <span className="hidden md:inline">
                  {weatherError || statsError || activitiesError ? 'Connection Issues' : 'Live Data'}
                </span>
              </div>
              
              <button
                onClick={refreshAllData}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-green-600 bg-white rounded-lg border border-gray-200 hover:border-green-300 transition-all duration-200 hover:shadow-md"
                title="Refresh all data"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden md:inline">Refresh</span>
              </button>
            </div>
          </div>
          
          {/* Last Updated Info */}
          {(weatherLastUpdated || statsLastUpdated) && (
            <div className="text-xs text-gray-500 animate-fade-in">
              Last updated: {new Date(weatherLastUpdated || statsLastUpdated).toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          {isLoading ? (
            // Loading skeletons for stats
            Array.from({ length: 4 }).map((_, index) => (
              <CardSkeleton key={index} lines={2} />
            ))
          ) : (
            stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index} 
                  className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg hover:shadow-green-100 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 animate-scale-in group cursor-pointer"
                  style={{ animationDelay: getAnimationDelay(index) }}
                  onClick={() => {
                    // Add click functionality based on stat type
                    if (stat.title === 'Total Predictions') navigate('/reports');
                    else if (stat.title === 'Active Fields') navigate('/fields');
                    else if (stat.title === 'Avg. Accuracy') navigate('/analytics');
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1 group-hover:text-gray-700 transition-colors">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`h-6 w-6 ${stat.color} group-hover:animate-bounce-subtle`} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div 
              className="bg-white rounded-xl border border-gray-100 p-6 mb-8 animate-slide-in-left shadow-sm hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: '400ms' }}
            >
              <h2 className="text-xl font-display font-semibold text-gray-900 mb-6">
                {t('dashboard.quickActions')}
              </h2>
              
              {isLoading ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <CardSkeleton key={index} lines={2} />
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={index}
                        onClick={action.onClick}
                        className="group text-left p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg hover:shadow-green-50 transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up"
                        style={{ animationDelay: `${500 + index * 100}ms` }}
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                            <Icon className="h-6 w-6 text-white group-hover:animate-bounce-subtle" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                              {action.title}
                            </h3>
                            <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                              {action.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Predictions */}
            <div 
              className="bg-white rounded-xl border border-gray-100 p-6 animate-slide-in-left shadow-sm hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: '600ms' }}
            >
              <h2 className="text-xl font-display font-semibold text-gray-900 mb-6">
                Recent Predictions
              </h2>
              
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <CardSkeleton key={index} lines={1} />
                  ))}
                </div>
              ) : predictions.length > 0 ? (
                <div className="space-y-4">
                  {predictions.slice(0, 3).map((prediction) => (
                    <div key={prediction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Leaf className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{prediction.cropType || 'Crop'} Prediction</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(prediction.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          {prediction.expectedYield || 'N/A'} tons/ha
                        </p>
                        <p className="text-sm text-gray-600">
                          {prediction.confidence || '95'}% confidence
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No predictions yet</p>
                  <button
                    onClick={() => navigate('/prediction')}
                    className="bg-gradient-primary text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    Create Your First Prediction
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weather Widget */}
            <div 
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-slide-in-right"
              style={{ animationDelay: '500ms' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Weather Today</h3>
                <Cloud className="h-6 w-6 animate-float" />
              </div>
              
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="h-4 w-16 bg-blue-400 rounded animate-pulse"></div>
                      <div className="h-4 w-12 bg-blue-400 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Location</span>
                    <span className="font-medium">{weatherData.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Temperature</span>
                    <span className="text-2xl font-bold animate-pulse-slow">{weatherData.temperature}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Humidity</span>
                    <span className="font-medium">{weatherData.humidity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Rainfall</span>
                    <span className="font-medium flex items-center">
                      <Droplets className="h-4 w-4 mr-1 animate-bounce-subtle" />
                      {weatherData.rainfall}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div 
              className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all duration-300 animate-slide-in-right"
              style={{ animationDelay: '700ms' }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('dashboard.recentActivity')}
              </h3>
              
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {(activities || []).map((activity, index) => {
                    // Map icon type to actual icon component
                    const iconMap = {
                      'TrendingUp': TrendingUp,
                      'MapPin': MapPin,
                      'BarChart3': BarChart3
                    };
                    const Icon = iconMap[activity.iconType] || TrendingUp;
                    return (
                      <div 
                        key={activity.id} 
                        className="flex items-start space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200 animate-fade-in-up"
                        style={{ animationDelay: `${800 + index * 100}ms` }}
                      >
                        <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform duration-200`}>
                          <Icon className={`h-4 w-4 ${activity.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.timestamp}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tips */}
            <div 
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 shadow-sm hover:shadow-lg transition-all duration-300 animate-slide-in-right"
              style={{ animationDelay: '900ms' }}
            >
              <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                <span className="animate-bounce-subtle mr-2">💡</span> Pro Tip
              </h3>
              <p className="text-sm text-green-800 leading-relaxed">
                Regular soil testing every 6 months can improve prediction accuracy by up to 15%. 
                Keep your field data updated for the best results.
              </p>
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => navigate('/prediction')}
            className="bg-gradient-primary text-white w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:rotate-12 animate-float group"
            title="Create New Prediction"
          >
            <PlusCircle className="h-8 w-8 mx-auto group-hover:animate-spin" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;