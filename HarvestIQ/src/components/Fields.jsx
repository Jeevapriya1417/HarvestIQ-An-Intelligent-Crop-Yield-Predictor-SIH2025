import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Beaker, 
  ArrowLeft,
  Map,
  Globe,
  Ruler,
  Leaf
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Navbar from './Navbar';
import { Button, Card, LoadingSpinner, Input, Select } from './ui';
import { fieldAPI } from '../services/api';

const Fields = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useApp();
  
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingField, setEditingField] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    coordinates: { latitude: '', longitude: '' },
    size: '',
    soilType: '',
    description: '',
    currentCrop: ''
  });

  const soilTypeOptions = [
    { value: 'loamy', label: 'Loamy Soil' },
    { value: 'clay', label: 'Clay Soil' },
    { value: 'sandy', label: 'Sandy Soil' },
    { value: 'silt', label: 'Silt Soil' },
    { value: 'peaty', label: 'Peaty Soil' },
    { value: 'chalky', label: 'Chalky Soil' }
  ];

  const cropOptions = [
    { value: 'Wheat', label: 'Wheat (गेहूं)' },
    { value: 'Rice', label: 'Rice (चावल)' },
    { value: 'Sugarcane', label: 'Sugarcane (गन्ना)' },
    { value: 'Cotton', label: 'Cotton (कपास)' },
    { value: 'Maize', label: 'Maize (मक्का)' },
    { value: 'Barley', label: 'Barley (जौ)' },
    { value: '', label: 'No current crop' }
  ];

  // Fetch fields
  useEffect(() => {
    const fetchFields = async () => {
      try {
        setLoading(true);
        const result = await fieldAPI.getFields();
        
        if (result.success) {
          setFields(result.data || []);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to fetch fields');
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('coordinates.')) {
      const coordField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        coordinates: {
          ...prev.coordinates,
          [coordField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      coordinates: { latitude: '', longitude: '' },
      size: '',
      soilType: '',
      description: '',
      currentCrop: ''
    });
    setShowAddForm(false);
    setEditingField(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const fieldData = {
        ...formData,
        size: parseFloat(formData.size),
        coordinates: {
          latitude: parseFloat(formData.coordinates.latitude),
          longitude: parseFloat(formData.coordinates.longitude)
        }
      };

      let result;
      if (editingField) {
        result = await fieldAPI.updateField(editingField._id, fieldData);
      } else {
        result = await fieldAPI.createField(fieldData);
      }

      if (result.success) {
        // Refresh fields list
        const fieldsResult = await fieldAPI.getFields();
        if (fieldsResult.success) {
          setFields(fieldsResult.data || []);
        }
        resetForm();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to save field');
    }
  };

  const handleEdit = (field) => {
    setFormData({
      name: field.name,
      coordinates: {
        latitude: field.coordinates?.latitude?.toString() || '',
        longitude: field.coordinates?.longitude?.toString() || ''
      },
      size: field.size?.toString() || '',
      soilType: field.soilType || '',
      description: field.description || '',
      currentCrop: field.currentCrop || ''
    });
    setEditingField(field);
    setShowAddForm(true);
  };

  const handleDelete = async (fieldId) => {
    if (!confirm('Are you sure you want to delete this field?')) {
      return;
    }

    try {
      const result = await fieldAPI.deleteField(fieldId);
      if (result.success) {
        setFields(fields.filter(f => f._id !== fieldId));
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to delete field');
    }
  };

  const openLocationInMaps = (latitude, longitude) => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank');
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
                Field Management
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Manage your agricultural fields and their properties
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Field</span>
          </Button>
        </div>

        {/* Add/Edit Field Form */}
        {showAddForm && (
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingField ? 'Edit Field' : 'Add New Field'}
              </h2>
              <Button variant="outline" size="sm" onClick={resetForm}>
                Cancel
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Field Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., North Field"
                  required
                />
                
                <Input
                  label="Field Size (hectares)"
                  type="number"
                  step="0.01"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  placeholder="e.g., 2.5"
                  required
                />
                
                <Input
                  label="Latitude"
                  type="number"
                  step="any"
                  name="coordinates.latitude"
                  value={formData.coordinates.latitude}
                  onChange={handleInputChange}
                  placeholder="e.g., 28.6139"
                  required
                />
                
                <Input
                  label="Longitude"
                  type="number"
                  step="any"
                  name="coordinates.longitude"
                  value={formData.coordinates.longitude}
                  onChange={handleInputChange}
                  placeholder="e.g., 77.2090"
                  required
                />
                
                <Select
                  label="Soil Type"
                  name="soilType"
                  value={formData.soilType}
                  onChange={handleInputChange}
                  options={soilTypeOptions}
                />
                
                <Select
                  label="Current Crop"
                  name="currentCrop"
                  value={formData.currentCrop}
                  onChange={handleInputChange}
                  options={cropOptions}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Additional information about this field..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingField ? 'Update Field' : 'Add Field'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Fields List */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <Card className="p-6">
              <div className="text-center text-red-600 dark:text-red-400">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{error}</p>
                <Button onClick={() => window.location.reload()} className="mt-4">
                  Try Again
                </Button>
              </div>
            </Card>
          ) : fields.length === 0 ? (
            <Card className="p-6">
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No fields added yet</p>
                <Button onClick={() => setShowAddForm(true)}>
                  Add Your First Field
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fields.map((field) => (
                <Card key={field._id} className="p-6 hover:shadow-lg transition-shadow dark:hover:shadow-xl">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{field.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{field.size} hectares</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(field)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(field._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {field.coordinates && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {field.coordinates.latitude?.toFixed(4)}, {field.coordinates.longitude?.toFixed(4)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openLocationInMaps(field.coordinates.latitude, field.coordinates.longitude)}
                        >
                          <Globe className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    
                    {field.soilType && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Beaker className="h-4 w-4" />
                        <span className="capitalize">{field.soilType} soil</span>
                      </div>
                    )}
                    
                    {field.currentCrop && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Leaf className="h-4 w-4" />
                        <span>Currently growing: {field.currentCrop}</span>
                      </div>
                    )}
                    
                    {field.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        {field.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/prediction?field=${field._id}`)}
                      className="w-full"
                    >
                      Create Prediction for this Field
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Fields;