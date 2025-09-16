import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, CheckCircle, AlertCircle, Leaf, Beaker, Cloud, ArrowRight, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Navbar from './Navbar';
import { Button, Input, Select, Card, ProgressBar, LoadingSpinner, Alert } from './ui';
import predictionEngine from '../services/predictionEngine';

const PredictionForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addPrediction, user } = useApp();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    cropType: '', farmArea: '', region: '', phLevel: '', organicContent: '',
    nitrogen: '', phosphorus: '', potassium: '', rainfall: '', temperature: '', humidity: ''
  });
  const [prediction, setPrediction] = useState(null);
  const [errors, setErrors] = useState({});

  const cropOptions = [
    { value: 'Wheat', label: 'Wheat (गेहूं)' },
    { value: 'Rice', label: 'Rice (चावल)' },
    { value: 'Sugarcane', label: 'Sugarcane (गन्ना)' },
    { value: 'Cotton', label: 'Cotton (कपास)' },
    { value: 'Maize', label: 'Maize (मक्का)' },
    { value: 'Barley', label: 'Barley (जौ)' }
  ];

  const regionOptions = [
    { value: 'Punjab', label: 'Punjab (पंजाब)' },
    { value: 'Haryana', label: 'Haryana (हरियाणा)' },
    { value: 'Uttar Pradesh', label: 'Uttar Pradesh (उत्तर प्रदेश)' },
    { value: 'Rajasthan', label: 'Rajasthan (राजस्थान)' },
    { value: 'Gujarat', label: 'Gujarat (गुजरात)' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.cropType) newErrors.cropType = 'Crop type is required';
        if (!formData.farmArea) newErrors.farmArea = 'Farm area is required';
        if (!formData.region) newErrors.region = 'Region is required';
        break;
      case 2:
        if (!formData.phLevel) newErrors.phLevel = 'pH level is required';
        break;
      case 3:
        if (!formData.rainfall) newErrors.rainfall = 'Rainfall is required';
        if (!formData.temperature) newErrors.temperature = 'Temperature is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const generatePrediction = async () => {
    if (!validateStep(3)) return;
    
    setIsLoading(true);
    try {
      const inputData = { ...formData, farmerId: user?.id };
      const result = await predictionEngine.generatePrediction(inputData);
      setPrediction(result);
      addPrediction(result);
      setCurrentStep(4);
    } catch (error) {
      console.error('Prediction error:', error);
      setErrors({ general: 'Failed to generate prediction. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const progress = ((currentStep - 1) / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              {t('prediction.title')}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get AI-powered crop yield predictions using comprehensive agricultural data and government datasets
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <ProgressBar 
              value={progress} 
              showLabel 
              className="max-w-md mx-auto" 
            />
          </div>

          {/* Main Form Card */}
          <Card variant="glass" className="p-6 md:p-8">
            {currentStep <= 3 && (
              <div className="space-y-8">
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="animate-fade-in">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Leaf className="h-6 w-6 text-green-600" />
                      </div>
                      <h2 className="text-2xl font-display font-semibold text-gray-900">
                        Basic Information
                      </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Select
                        label="Crop Type"
                        name="cropType"
                        value={formData.cropType}
                        onChange={handleInputChange}
                        options={cropOptions}
                        error={errors.cropType}
                        required
                      />
                      
                      <Input
                        label="Farm Area (hectares)"
                        type="number"
                        name="farmArea"
                        value={formData.farmArea}
                        onChange={handleInputChange}
                        placeholder="e.g., 2.5"
                        error={errors.farmArea}
                        required
                      />
                      
                      <Select
                        label="Region"
                        name="region"
                        value={formData.region}
                        onChange={handleInputChange}
                        options={regionOptions}
                        error={errors.region}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Soil Health */}
                {currentStep === 2 && (
                  <div className="animate-fade-in">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Beaker className="h-6 w-6 text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-display font-semibold text-gray-900">
                        Soil Health Metrics
                      </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="pH Level"
                        type="number"
                        name="phLevel"
                        value={formData.phLevel}
                        onChange={handleInputChange}
                        placeholder="e.g., 6.5"
                        hint="Range: 0-14"
                        error={errors.phLevel}
                        required
                      />
                      
                      <Input
                        label="Organic Content (%)"
                        type="number"
                        name="organicContent"
                        value={formData.organicContent}
                        onChange={handleInputChange}
                        placeholder="e.g., 2.5"
                      />
                      
                      <Input
                        label="Nitrogen (kg/ha)"
                        type="number"
                        name="nitrogen"
                        value={formData.nitrogen}
                        onChange={handleInputChange}
                        placeholder="e.g., 60"
                      />
                      
                      <Input
                        label="Phosphorus (kg/ha)"
                        type="number"
                        name="phosphorus"
                        value={formData.phosphorus}
                        onChange={handleInputChange}
                        placeholder="e.g., 25"
                      />
                    </div>
                    
                    <Alert variant="info" className="mt-6">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Soil Testing Tip</p>
                          <p className="mt-1">For accurate results, get your soil tested by a certified laboratory. Government soil health cards provide comprehensive analysis.</p>
                        </div>
                      </div>
                    </Alert>
                  </div>
                )}

                {/* Step 3: Weather Data */}
                {currentStep === 3 && (
                  <div className="animate-fade-in">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Cloud className="h-6 w-6 text-purple-600" />
                      </div>
                      <h2 className="text-2xl font-display font-semibold text-gray-900">
                        Weather Information
                      </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Annual Rainfall (mm)"
                        type="number"
                        name="rainfall"
                        value={formData.rainfall}
                        onChange={handleInputChange}
                        placeholder="e.g., 800"
                        error={errors.rainfall}
                        required
                      />
                      
                      <Input
                        label="Average Temperature (°C)"
                        type="number"
                        name="temperature"
                        value={formData.temperature}
                        onChange={handleInputChange}
                        placeholder="e.g., 25"
                        error={errors.temperature}
                        required
                      />
                      
                      <Input
                        label="Humidity (%)"
                        type="number"
                        name="humidity"
                        value={formData.humidity}
                        onChange={handleInputChange}
                        placeholder="e.g., 70"
                        hint="Range: 0-100"
                      />
                    </div>
                    
                    <Alert variant="success" className="mt-6">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Government Data Integration</p>
                          <p className="mt-1">We integrate real-time data from India Meteorological Department (IMD) and historical weather patterns for enhanced accuracy.</p>
                        </div>
                      </div>
                    </Alert>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    variant="ghost"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="flex items-center"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  {currentStep < 3 ? (
                    <Button
                      variant="primary"
                      onClick={handleNext}
                      className="flex items-center"
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={generatePrediction}
                      isLoading={isLoading}
                      className="flex items-center"
                    >
                      {isLoading ? 'Analyzing...' : 'Generate Prediction'}
                      {!isLoading && <TrendingUp className="h-4 w-4 ml-2" />}
                    </Button>
                  )}
                </div>

                {errors.general && (
                  <Alert variant="error" className="mt-4">
                    {errors.general}
                  </Alert>
                )}
              </div>
            )}

            {/* Step 4: Results */}
            {currentStep === 4 && prediction && (
              <div className="animate-scale-in space-y-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">
                    Prediction Results
                  </h2>
                  <p className="text-gray-600">
                    Based on AI analysis and government agricultural datasets
                  </p>
                </div>

                {/* Main Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6 bg-gradient-success text-white">
                    <div className="flex items-center space-x-3 mb-4">
                      <TrendingUp className="h-8 w-8" />
                      <h3 className="text-xl font-semibold">Expected Yield</h3>
                    </div>
                    <div className="text-4xl font-bold mb-2">{prediction.expectedYield} tons/ha</div>
                    <p className="opacity-90">
                      Total yield: {prediction.totalYield} tons
                    </p>
                  </Card>
                  
                  <Card className="p-6 bg-gradient-primary text-white">
                    <div className="flex items-center space-x-3 mb-4">
                      <CheckCircle className="h-8 w-8" />
                      <h3 className="text-xl font-semibold">Confidence Level</h3>
                    </div>
                    <div className="text-4xl font-bold mb-2">{prediction.confidence}%</div>
                    <p className="opacity-90">Based on comprehensive analysis</p>
                  </Card>
                </div>

                {/* Recommendations */}
                {prediction.recommendations && prediction.recommendations.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Recommendations</h3>
                    <div className="space-y-4">
                      {prediction.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                          <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-gray-900">{rec.title}</h4>
                            <p className="text-gray-600 mt-1">{rec.description}</p>
                            {rec.action && (
                              <p className="text-sm text-orange-700 font-medium mt-2">
                                Action: {rec.action}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="primary"
                    onClick={() => navigate('/dashboard')}
                    size="lg"
                  >
                    Back to Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentStep(1);
                      setPrediction(null);
                      setFormData({
                        cropType: '', farmArea: '', region: '', phLevel: '', organicContent: '',
                        nitrogen: '', phosphorus: '', potassium: '', rainfall: '', temperature: '', humidity: ''
                      });
                      setErrors({});
                    }}
                    size="lg"
                  >
                    New Prediction
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PredictionForm;