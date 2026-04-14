import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  LineChart,
  Calendar,
  Target,
  Award,
  ArrowLeft,
  Download,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Navbar from './Navbar';
import { Button, Card, LoadingSpinner } from './ui';
import { predictionAPI } from '../services/api';

const Analytics = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useApp();
  
  const [stats, setStats] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30'); // days

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        // Fetch user stats and predictions
        const [statsResult, predictionsResult] = await Promise.all([
          predictionAPI.getUserStats(),
          predictionAPI.getPredictions({ limit: 100 })
        ]);
        
        if (statsResult.success) {
          setStats(statsResult.data);
        }
        
        if (predictionsResult.success) {
          setPredictions(predictionsResult.data || []);
        }
        
        if (!statsResult.success && !predictionsResult.success) {
          setError('Failed to fetch analytics data');
        }
      } catch (err) {
        setError('Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  // Calculate derived analytics
  const analytics = React.useMemo(() => {
    if (!predictions.length) {
      return {
        totalPredictions: 0,
        successRate: 0,
        avgProcessingTime: 0,
        cropDistribution: {},
        monthlyTrends: [],
        accuracyTrend: []
      };
    }

    // Filter predictions by time range
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));
    
    const filteredPredictions = predictions.filter(p => 
      new Date(p.createdAt) >= cutoffDate
    );

    // Calculate metrics
    const totalPredictions = filteredPredictions.length;
    const completedPredictions = filteredPredictions.filter(p => 
      p.processing?.status === 'completed'
    );
    const successRate = totalPredictions > 0 
      ? (completedPredictions.length / totalPredictions) * 100 
      : 0;

    // Average processing time
    const avgProcessingTime = completedPredictions.length > 0
      ? completedPredictions.reduce((sum, p) => sum + (p.processing?.processingTime || 0), 0) / completedPredictions.length
      : 0;

    // Crop distribution
    const cropDistribution = filteredPredictions.reduce((acc, p) => {
      const crop = p.inputData?.cropType || 'Unknown';
      acc[crop] = (acc[crop] || 0) + 1;
      return acc;
    }, {});

    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const monthPredictions = predictions.filter(p => {
        const pDate = new Date(p.createdAt);
        return pDate.getFullYear() === date.getFullYear() && 
               pDate.getMonth() === date.getMonth();
      });
      
      monthlyTrends.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        predictions: monthPredictions.length,
        completed: monthPredictions.filter(p => p.processing?.status === 'completed').length
      });
    }

    return {
      totalPredictions,
      successRate: Math.round(successRate),
      avgProcessingTime: Math.round(avgProcessingTime),
      cropDistribution,
      monthlyTrends,
      completedCount: completedPredictions.length
    };
  }, [predictions, timeRange]);

  const getCropDistributionItems = () => {
    return Object.entries(analytics.cropDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };

  const getColorForIndex = (index) => {
    const colors = [
      'bg-green-500',
      'bg-blue-500', 
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-hero dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
            
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Analyze your prediction patterns and performance
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              onClick={() => alert('Export functionality will be implemented in the next phase')}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <Card className="p-6">
            <div className="text-center text-red-600 dark:text-red-400">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Try Again
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Predictions</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.totalPredictions}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Last {timeRange} days</p>
                  </div>
                  <BarChart3 className="h-10 w-10 text-green-600" />
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.successRate}%</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Completed predictions</p>
                  </div>
                  <Target className="h-10 w-10 text-blue-600" />
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Processing</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.avgProcessingTime}ms</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Per prediction</p>
                  </div>
                  <LineChart className="h-10 w-10 text-purple-600" />
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.completedCount}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Successful predictions</p>
                  </div>
                  <Award className="h-10 w-10 text-yellow-600" />
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Monthly Trends */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Monthly Trends</h2>
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                </div>
                
                <div className="space-y-4">
                  {analytics.monthlyTrends.map((month, index) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{month.month}</span>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{month.completed} completed</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{month.predictions} total</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {analytics.monthlyTrends.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <LineChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No data available for the selected period</p>
                  </div>
                )}
              </Card>

              {/* Crop Distribution */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Crop Distribution</h2>
                  <PieChart className="h-5 w-5 text-gray-400" />
                </div>
                
                <div className="space-y-4">
                  {getCropDistributionItems().map(([crop, count], index) => {
                    const percentage = analytics.totalPredictions > 0 
                      ? Math.round((count / analytics.totalPredictions) * 100) 
                      : 0;
                    
                    return (
                      <div key={crop} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${getColorForIndex(index)}`}></div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{crop}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getColorForIndex(index)}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">{percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {Object.keys(analytics.cropDistribution).length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No crop data available</p>
                  </div>
                )}
              </Card>
            </div>

            {/* Performance Insights */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Performance Insights</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="font-semibold text-green-800 dark:text-green-200">
                    {analytics.successRate >= 90 ? 'Excellent' : 
                     analytics.successRate >= 70 ? 'Good' : 
                     analytics.successRate >= 50 ? 'Average' : 'Needs Improvement'}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">Prediction Success Rate</p>
                </div>
                
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold text-blue-800 dark:text-blue-200">
                    {analytics.totalPredictions >= 20 ? 'Very Active' :
                     analytics.totalPredictions >= 10 ? 'Active' :
                     analytics.totalPredictions >= 5 ? 'Moderate' : 'Getting Started'}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Usage Level</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <LineChart className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="font-semibold text-purple-800 dark:text-purple-200">
                    {analytics.avgProcessingTime < 1000 ? 'Fast' :
                     analytics.avgProcessingTime < 3000 ? 'Normal' : 'Slow'}
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Processing Speed</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;