import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  Search, 
  Eye, 
  TrendingUp,
  BarChart3,
  PieChart,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Navbar from './Navbar';
import { Button, Card, LoadingSpinner } from './ui';
import { predictionAPI } from '../services/api';

const Reports = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useApp();
  
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    cropType: 'all',
    status: 'all'
  });

  // Fetch prediction history
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        const result = await predictionAPI.getPredictions({
          page: 1,
          limit: 50,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });
        
        if (result.success) {
          setPredictions(result.data || []);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to fetch predictions');
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  const handleExportPDF = () => {
    // TODO: Implement PDF export functionality
    alert('PDF export functionality will be implemented in the next phase');
  };

  const handleExportCSV = () => {
    // TODO: Implement CSV export functionality
    alert('CSV export functionality will be implemented in the next phase');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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
                Prediction Reports
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                View and analyze your prediction history
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportPDF}
              className="flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Export PDF</span>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Predictions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{predictions.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {predictions.filter(p => {
                    const date = new Date(p.createdAt);
                    const now = new Date();
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {predictions.filter(p => p.processing?.status === 'completed').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {predictions.length > 0 
                    ? Math.round((predictions.filter(p => p.processing?.status === 'completed').length / predictions.length) * 100)
                    : 0}%
                </p>
              </div>
              <PieChart className="h-8 w-8 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Predictions List */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Prediction History</h2>
            
            {/* Search and Filter - Placeholder for future implementation */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search predictions..."
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 dark:text-red-400 mb-4">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{error}</p>
              </div>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : predictions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No predictions found</p>
              <Button onClick={() => navigate('/prediction')}>
                Create Your First Prediction
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Crop Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Area (ha)</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Yield Prediction</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((prediction) => (
                    <tr key={prediction._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {formatDate(prediction.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {prediction.inputData?.cropType || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {prediction.inputData?.farmArea || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prediction.processing?.status)}`}>
                          {prediction.processing?.status || 'unknown'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {prediction.results?.yieldPrediction 
                          ? `${prediction.results.yieldPrediction} kg/ha`
                          : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement detailed view
                            alert('Detailed view will be implemented in the next phase');
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Reports;