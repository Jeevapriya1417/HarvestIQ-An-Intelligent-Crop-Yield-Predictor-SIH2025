import React from 'react';
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
  Droplets
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Navbar from './Navbar';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, predictions } = useApp();

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

  const weatherData = {
    location: 'Punjab, India',
    temperature: '28°C',
    humidity: '65%',
    rainfall: '12mm',
    condition: 'Partly Cloudy'
  };

  const recentActivities = [
    {
      id: 1,
      action: 'Wheat yield prediction completed',
      timestamp: '2 hours ago',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      id: 2,
      action: 'Field #3 soil data updated',
      timestamp: '1 day ago',
      icon: Leaf,
      color: 'text-blue-600'
    },
    {
      id: 3,
      action: 'Rice prediction analysis started',
      timestamp: '2 days ago',
      icon: BarChart3,
      color: 'text-purple-600'
    }
  ];

  const stats = [
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
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'User'}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            {t('dashboard.subtitle')}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
              <h2 className="text-xl font-display font-semibold text-gray-900 mb-6">
                {t('dashboard.quickActions')}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={action.onClick}
                      className="group text-left p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Predictions */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-xl font-display font-semibold text-gray-900 mb-6">
                Recent Predictions
              </h2>
              
              {predictions.length > 0 ? (
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
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Weather Today</h3>
                <Cloud className="h-6 w-6" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Location</span>
                  <span className="font-medium">{weatherData.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Temperature</span>
                  <span className="text-2xl font-bold">{weatherData.temperature}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Humidity</span>
                  <span className="font-medium">{weatherData.humidity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Rainfall</span>
                  <span className="font-medium flex items-center">
                    <Droplets className="h-4 w-4 mr-1" />
                    {weatherData.rainfall}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('dashboard.recentActivity')}
              </h3>
              
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0`}>
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
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-3">💡 Pro Tip</h3>
              <p className="text-sm text-green-800 leading-relaxed">
                Regular soil testing every 6 months can improve prediction accuracy by up to 15%. 
                Keep your field data updated for the best results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;