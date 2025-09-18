import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, CheckCircle, AlertCircle, Leaf, Beaker, Cloud, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Navbar from './Navbar';
import { Button, Input, Select, Card, ProgressBar, LoadingSpinner, Alert } from './ui';
import predictionEngine from '../services/predictionEngine';
import { FormValidators, ValidationUtils } from '../utils/validation';
import { useStaggeredAnimation, useDelayedVisibility } from '../hooks/useAnimations';

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
  const [warnings, setWarnings] = useState({});
  const [touched, setTouched] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [stepAnimating, setStepAnimating] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [predictionProgress, setPredictionProgress] = useState(0);
  
  // Custom animation hooks
  const isHeaderVisible = useDelayedVisibility(300);
  const isFormVisible = useDelayedVisibility(600);
  
  // Step completion tracking
  const [completedSteps, setCompletedSteps] = useState(new Set());

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
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Clear errors for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate on blur
    const validationResult = FormValidators.prediction(formData);
    const fieldError = validationResult.getFirstError(name);
    
    if (fieldError) {
      setErrors(prev => ({ ...prev, [name]: fieldError }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.cropType) newErrors.cropType = 'Please select a crop type';
        if (!formData.farmArea) newErrors.farmArea = 'Please enter farm area';
        else if (parseFloat(formData.farmArea) <= 0) newErrors.farmArea = 'Farm area must be greater than 0';
        else if (parseFloat(formData.farmArea) > 10000) newErrors.farmArea = 'Farm area cannot exceed 10,000 hectares';
        if (!formData.region) newErrors.region = 'Please select a region';
        break;
      case 2:
        if (!formData.phLevel) newErrors.phLevel = 'Please enter pH level';
        else if (parseFloat(formData.phLevel) < 0 || parseFloat(formData.phLevel) > 14) {
          newErrors.phLevel = 'pH level must be between 0 and 14';
        }
        if (formData.organicContent && (parseFloat(formData.organicContent) < 0 || parseFloat(formData.organicContent) > 100)) {
          newErrors.organicContent = 'Organic content must be between 0% and 100%';
        }
        break;
      case 3:
        if (!formData.rainfall) newErrors.rainfall = 'Please enter rainfall data';
        else if (parseFloat(formData.rainfall) < 0) newErrors.rainfall = 'Rainfall cannot be negative';
        if (!formData.temperature) newErrors.temperature = 'Please enter temperature data';
        else if (parseFloat(formData.temperature) < -50 || parseFloat(formData.temperature) > 60) {
          newErrors.temperature = 'Temperature must be between -50°C and 60°C';
        }
        if (formData.humidity && (parseFloat(formData.humidity) < 0 || parseFloat(formData.humidity) > 100)) {
          newErrors.humidity = 'Humidity must be between 0% and 100%';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (validateStep(currentStep)) {
      setStepAnimating(true);
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      
      // Smooth transition animation
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setStepAnimating(false);
      }, 200);
    }
  };

  const handlePrevious = () => {
    setStepAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => prev - 1);
      setStepAnimating(false);
    }, 200);
  };

  const generatePrediction = async () => {
    if (!validateStep(3)) return;
    
    setIsLoading(true);
    setErrors({});
    setPredictionProgress(0);
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setPredictionProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 20;
      });
    }, 200);
    
    try {
      const inputData = { ...formData, farmerId: user?.id };
      const result = await predictionEngine.generatePrediction(inputData);
      
      // Complete progress
      setPredictionProgress(100);
      clearInterval(progressInterval);
      
      if (result.success) {
        setPrediction(result);
        addPrediction(result);
        setShowSuccessAnimation(true);
        
        // Smooth transition to results
        setTimeout(() => {
          setCurrentStep(4);
          setShowSuccessAnimation(false);
        }, 1500);
      } else {
        setErrors({ general: result.error || 'Failed to generate prediction. Please try again.' });
      }
    } catch (error) {
      console.error('Prediction error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
      clearInterval(progressInterval);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setPredictionProgress(0);
      }, 800);
    }
  };

  const progress = ((currentStep - 1) / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-hero dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className={`text-center mb-8 transition-all duration-700 ${isHeaderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4 animate-fade-in-down">
              {t('prediction.title')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              Get AI-powered crop yield predictions using comprehensive agricultural data
            </p>
          </div>

          {/* Enhanced Progress Section */}
          <div className={`mb-8 transition-all duration-700 ${isFormVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex justify-center items-center space-x-4 mb-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                    step < currentStep || completedSteps.has(step) 
                      ? 'bg-green-500 text-white animate-scale-in' 
                      : step === currentStep 
                        ? 'bg-green-100 text-green-600 ring-2 ring-green-500 animate-pulse-slow' 
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step < currentStep || completedSteps.has(step) ? (
                      <CheckCircle className="h-5 w-5 animate-bounce-subtle" />
                    ) : (
                      step
                    )}
                  </div>
                  {step < 4 && (
                    <div className={`w-16 h-1 mx-2 transition-all duration-500 ${
                      step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            
            <ProgressBar 
              value={progress} 
              showLabel 
              className="max-w-md mx-auto animate-slide-up" 
              color="green"
            />
            
            <div className="text-center mt-3">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Step {currentStep} of 4
              </span>
            </div>
          </div>

          {/* Error Alert */}
          {errors.general && (
            <Alert variant="error" className="mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>{errors.general}</span>
              </div>
            </Alert>
          )}

          {/* Main Form Card */}
          <Card variant="glass" className={`p-6 md:p-8 transition-all duration-500 ${
            stepAnimating ? 'opacity-50 scale-98' : 'opacity-100 scale-100'
          } ${isFormVisible ? 'animate-slide-up' : ''}`}>
            {currentStep <= 3 && (
              <div className="space-y-8">
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="animate-fade-in">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                        <Leaf className="h-6 w-6 text-green-600" />
                      </div>
                      <h2 className="text-2xl font-display font-semibold text-gray-900 dark:text-white">
                        Basic Information
                      </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Select
                        label="Crop Type"
                        name="cropType"
                        value={formData.cropType}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        options={cropOptions}
                        error={errors.cropType}
                        warning={warnings.cropType}
                        isValidating={isValidating && touched.cropType}
                        required
                      />
                      
                      <Input
                        label="Farm Area (hectares)"
                        type="number"
                        step="0.01"
                        min="0.01"
                        name="farmArea"
                        value={formData.farmArea}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="e.g., 2.5"
                        hint="Enter total area in hectares"
                        error={errors.farmArea}
                        warning={warnings.farmArea}
                        isValidating={isValidating && touched.farmArea}
                        required
                      />
                      
                      <Select
                        label="Region"
                        name="region"
                        value={formData.region}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        options={regionOptions}
                        error={errors.region}
                        warning={warnings.region}
                        isValidating={isValidating && touched.region}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Soil Health */}
                {currentStep === 2 && (
                  <div className="animate-fade-in">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                        <Beaker className="h-6 w-6 text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-display font-semibold text-gray-900 dark:text-white">
                        Soil Health Metrics
                      </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="pH Level"
                        type="number"
                        step="0.1"
                        min="0"
                        max="14"
                        name="phLevel"
                        value={formData.phLevel}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="e.g., 6.5"
                        hint="Soil pH (0-14 scale)"
                        error={errors.phLevel}
                        warning={warnings.phLevel}
                        isValidating={isValidating && touched.phLevel}
                        required
                      />
                      
                      <Input
                        label="Organic Content (%)"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        name="organicContent"
                        value={formData.organicContent}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="e.g., 3.2"
                        hint="Percentage of organic matter"
                        error={errors.organicContent}
                        warning={warnings.organicContent}
                        isValidating={isValidating && touched.organicContent}
                      />
                      
                      <Input
                        label="Nitrogen (N) mg/kg"
                        type="number"
                        step="0.1"
                        min="0"
                        name="nitrogen"
                        value={formData.nitrogen}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="e.g., 280"
                        hint="Available nitrogen"
                        error={errors.nitrogen}
                        warning={warnings.nitrogen}
                        isValidating={isValidating && touched.nitrogen}
                      />
                      
                      <Input
                        label="Phosphorus (P) mg/kg"
                        type="number"
                        step="0.1"
                        min="0"
                        name="phosphorus"
                        value={formData.phosphorus}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="e.g., 45"
                        hint="Available phosphorus"
                        error={errors.phosphorus}
                        warning={warnings.phosphorus}
                        isValidating={isValidating && touched.phosphorus}
                      />
                      
                      <Input
                        label="Potassium (K) mg/kg"
                        type="number"
                        step="0.1"
                        min="0"
                        name="potassium"
                        value={formData.potassium}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="e.g., 310"
                        hint="Available potassium"
                        error={errors.potassium}
                        warning={warnings.potassium}
                        isValidating={isValidating && touched.potassium}
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Weather Data */}
                {currentStep === 3 && (
                  <div className="animate-fade-in">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center">
                        <Cloud className="h-6 w-6 text-orange-600" />
                      </div>
                      <h2 className="text-2xl font-display font-semibold text-gray-900 dark:text-white">
                        Weather Conditions
                      </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Rainfall (mm)"
                        type="number"
                        step="0.1"
                        min="0"
                        name="rainfall"
                        value={formData.rainfall}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="e.g., 800"
                        hint="Annual rainfall"
                        error={errors.rainfall}
                        warning={warnings.rainfall}
                        isValidating={isValidating && touched.rainfall}
                        required
                      />
                      
                      <Input
                        label="Temperature (°C)"
                        type="number"
                        step="0.1"
                        name="temperature"
                        value={formData.temperature}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="e.g., 25"
                        hint="Average temperature"
                        error={errors.temperature}
                        warning={warnings.temperature}
                        isValidating={isValidating && touched.temperature}
                        required
                      />
                      
                      <Input
                        label="Humidity (%)"
                        type="number"
                        step="1"
                        min="0"
                        max="100"
                        name="humidity"
                        value={formData.humidity}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="e.g., 65"
                        hint="Relative humidity"
                        error={errors.humidity}
                        warning={warnings.humidity}
                        isValidating={isValidating && touched.humidity}
                      />
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="flex items-center space-x-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </Button>
                  
                  {currentStep < 3 ? (
                    <Button
                      variant="primary"
                      onClick={handleNext}
                      className="flex items-center space-x-2"
                    >
                      <span>Next</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={generatePrediction}
                      isLoading={isLoading}
                      disabled={isLoading}
                      className="flex items-center space-x-2"
                    >
                      <TrendingUp className="h-4 w-4" />
                      <span>{isLoading ? 'Generating...' : 'Generate Prediction'}</span>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Prediction Results */}
            {currentStep === 4 && prediction && (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                
                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                  Prediction Generated Successfully!
                </h2>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">Expected Yield</h3>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {prediction.prediction?.expectedYield || 'N/A'} tons/ha
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                    Confidence: {prediction.confidence || 95}%
                  </p>
                </div>
                
                <div className="flex justify-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                  >
                    New Prediction
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/dashboard')}
                  >
                    Back to Dashboard
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