import mongoose from 'mongoose';

const aiModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Model name is required'],
    trim: true,
    unique: true,
    index: true
  },
  description: {
    type: String,
    maxLength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  version: {
    type: String,
    required: [true, 'Model version is required'],
    default: '1.0.0'
  },
  type: {
    type: String,
    required: [true, 'Model type is required'],
    enum: ['javascript', 'python-ml', 'python-dl', 'ensemble'],
    default: 'javascript'
  },
  cropType: {
    type: String,
    required: [true, 'Crop type is required'],
    enum: ['Wheat', 'Rice', 'Sugarcane', 'Cotton', 'Maize', 'Barley', 'Mustard', 'Potato', 'Onion', 'Tomato']
  },
  region: {
    type: String,
    default: 'all'
  },
  accuracy: {
    type: Number,
    min: [0, 'Accuracy must be between 0 and 100'],
    max: [100, 'Accuracy must be between 0 and 100'],
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const AiModel = mongoose.model('AiModel', aiModelSchema);

export default AiModel;
