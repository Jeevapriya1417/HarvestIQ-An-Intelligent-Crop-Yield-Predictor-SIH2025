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
    required: [true, 'Crop type is required']
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
  },
  configuration: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  performance: {
    totalPredictions: {
      type: Number,
      default: 0
    },
    successfulPredictions: {
      type: Number,
      default: 0
    },
    failedPredictions: {
      type: Number,
      default: 0
    },
    averageProcessingTime: {
      type: Number,
      default: 0
    },
    lastUsed: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true
});

// Instance method to update model performance
aiModelSchema.methods.updatePerformance = async function({ success, processingTime }) {
  try {
    // Initialize performance tracking if not exists
    if (!this.performance) {
      this.performance = {
        totalPredictions: 0,
        successfulPredictions: 0,
        failedPredictions: 0,
        averageProcessingTime: 0,
        lastUsed: null
      };
    }

    // Update counters
    this.performance.totalPredictions += 1;
    
    if (success) {
      this.performance.successfulPredictions += 1;
      
      // Update average processing time
      if (processingTime) {
        const totalTime = this.performance.averageProcessingTime * (this.performance.successfulPredictions - 1) + processingTime;
        this.performance.averageProcessingTime = totalTime / this.performance.successfulPredictions;
      }
    } else {
      this.performance.failedPredictions += 1;
    }

    this.performance.lastUsed = new Date();
    
    await this.save();
  } catch (error) {
    console.error('Error updating model performance:', error);
    // Don't throw - this is a non-critical operation
  }
};

const AiModel = mongoose.model('AiModel', aiModelSchema);

export default AiModel;
