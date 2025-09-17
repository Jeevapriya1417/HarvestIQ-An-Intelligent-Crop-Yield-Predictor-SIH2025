import mongoose from 'mongoose';

const aiModelSchema = new mongoose.Schema({
  // Model identification
  name: {
    type: String,
    required: [true, 'Model name is required'],
    trim: true,
    unique: true,
    maxLength: [100, 'Model name cannot exceed 100 characters']
  },

  version: {
    type: String,
    required: [true, 'Model version is required'],
    trim: true,
    match: [/^\d+\.\d+\.\d+$/, 'Version must follow semantic versioning (e.g., 1.0.0)']
  },

  // Model type and technology
  type: {
    type: String,
    required: [true, 'Model type is required'],
    enum: ['javascript', 'python-ml', 'python-dl', 'ensemble', 'external-api'],
    index: true
  },

  framework: {
    type: String,
    enum: ['sklearn', 'tensorflow', 'pytorch', 'xgboost', 'lightgbm', 'custom', 'javascript'],
    default: 'custom'
  },

  algorithm: {
    type: String,
    default: ''
  },

  // Model metadata
  description: {
    type: String,
    maxLength: [1000, 'Description cannot exceed 1000 characters'],
    default: ''
  },

  author: {
    type: String,
    default: 'HarvestIQ Team'
  },

  // Supported crops and regions
  supportedCrops: [{
    type: String,
    enum: ['Wheat', 'Rice', 'Sugarcane', 'Cotton', 'Maize', 'Barley', 'Mustard', 'Potato', 'Onion', 'Tomato', 'All']
  }],

  supportedRegions: [{
    type: String
  }],

  // Model configuration
  configuration: {
    // Service endpoints for external models
    serviceUrl: {
      type: String,
      default: null
    },
    
    apiKey: {
      type: String,
      default: null,
      select: false // Don't include in queries by default
    },

    // Model parameters
    parameters: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: new Map()
    },

    // Input/output schema definitions
    inputSchema: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },

    outputSchema: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },

    // Resource requirements
    requirements: {
      memory: {
        type: String,
        default: 'Low' // Low, Medium, High
      },
      cpu: {
        type: String,
        default: 'Low'
      },
      gpu: {
        type: Boolean,
        default: false
      },
      timeout: {
        type: Number,
        default: 30000 // 30 seconds in milliseconds
      }
    }
  },

  // Model performance metrics
  performance: {
    // Accuracy metrics
    accuracy: {
      overall: {
        type: Number,
        min: 0,
        max: 100,
        default: null
      },
      byCrop: {
        type: Map,
        of: Number,
        default: new Map()
      },
      byRegion: {
        type: Map,
        of: Number,
        default: new Map()
      }
    },

    // Performance statistics
    statistics: {
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
    },

    // User feedback
    userRatings: {
      averageRating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
      },
      totalRatings: {
        type: Number,
        default: 0
      },
      ratingDistribution: {
        type: Map,
        of: Number,
        default: new Map()
      }
    }
  },

  // Model status and availability
  status: {
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    isTesting: {
      type: Boolean,
      default: false
    },
    healthStatus: {
      type: String,
      enum: ['healthy', 'degraded', 'down', 'unknown'],
      default: 'unknown'
    },
    lastHealthCheck: {
      type: Date,
      default: null
    }
  },

  // Training information
  training: {
    trainedOn: {
      type: Date,
      default: null
    },
    trainingDataSize: {
      type: Number,
      default: null
    },
    validationScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    trainingNotes: {
      type: String,
      maxLength: 500,
      default: ''
    }
  },

  // Version control
  changelog: [{
    version: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    changes: {
      type: String,
      required: true
    },
    author: {
      type: String,
      default: 'HarvestIQ Team'
    }
  }],

  // Deprecation info
  deprecation: {
    isDeprecated: {
      type: Boolean,
      default: false
    },
    deprecatedOn: {
      type: Date,
      default: null
    },
    replacedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AiModel',
      default: null
    },
    reason: {
      type: String,
      default: ''
    }
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
aiModelSchema.index({ type: 1, 'status.isActive': 1 });
aiModelSchema.index({ 'status.isDefault': 1 });
aiModelSchema.index({ supportedCrops: 1 });
aiModelSchema.index({ 'performance.accuracy.overall': -1 });
aiModelSchema.index({ 'performance.statistics.totalPredictions': -1 });
aiModelSchema.index({ 'status.healthStatus': 1 });

// Compound index for name and version uniqueness
aiModelSchema.index({ name: 1, version: 1 }, { unique: true });

// Virtual for model identifier
aiModelSchema.virtual('identifier').get(function() {
  return `${this.name}@${this.version}`;
});

// Virtual for success rate
aiModelSchema.virtual('successRate').get(function() {
  const stats = this.performance.statistics;
  if (stats.totalPredictions > 0) {
    return Math.round((stats.successfulPredictions / stats.totalPredictions) * 100);
  }
  return 0;
});

// Virtual for model age
aiModelSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for health status color
aiModelSchema.virtual('healthColor').get(function() {
  const statusColors = {
    healthy: 'green',
    degraded: 'yellow',
    down: 'red',
    unknown: 'gray'
  };
  return statusColors[this.status.healthStatus] || 'gray';
});

// Instance methods
aiModelSchema.methods.updatePerformance = function(predictionResult) {
  const stats = this.performance.statistics;
  
  stats.totalPredictions += 1;
  stats.lastUsed = new Date();
  
  if (predictionResult.success) {
    stats.successfulPredictions += 1;
    
    // Update average processing time
    if (predictionResult.processingTime) {
      const currentAvg = stats.averageProcessingTime || 0;
      stats.averageProcessingTime = Math.round(
        (currentAvg * (stats.successfulPredictions - 1) + predictionResult.processingTime) / stats.successfulPredictions
      );
    }
  } else {
    stats.failedPredictions += 1;
  }
  
  return this.save();
};

aiModelSchema.methods.addUserRating = function(rating) {
  const userRatings = this.performance.userRatings;
  
  // Update average rating
  const currentTotal = userRatings.totalRatings;
  const currentAvg = userRatings.averageRating || 0;
  
  userRatings.totalRatings = currentTotal + 1;
  userRatings.averageRating = Number(
    ((currentAvg * currentTotal) + rating) / userRatings.totalRatings
  ).toFixed(2);
  
  // Update rating distribution
  const ratingKey = rating.toString();
  const currentCount = userRatings.ratingDistribution.get(ratingKey) || 0;
  userRatings.ratingDistribution.set(ratingKey, currentCount + 1);
  
  return this.save();
};

aiModelSchema.methods.updateHealthStatus = function(status) {
  this.status.healthStatus = status;
  this.status.lastHealthCheck = new Date();
  return this.save();
};

aiModelSchema.methods.deprecate = function(reason, replacementModel = null) {
  this.deprecation.isDeprecated = true;
  this.deprecation.deprecatedOn = new Date();
  this.deprecation.reason = reason;
  this.status.isActive = false;
  
  if (replacementModel) {
    this.deprecation.replacedBy = replacementModel;
  }
  
  return this.save();
};

aiModelSchema.methods.addChangelog = function(version, changes, author = 'HarvestIQ Team') {
  this.changelog.push({
    version,
    changes,
    author,
    date: new Date()
  });
  return this.save();
};

// Static methods
aiModelSchema.statics.findActive = function(options = {}) {
  const query = { 
    'status.isActive': true,
    'deprecation.isDeprecated': false
  };
  
  if (options.type) {
    query.type = options.type;
  }
  
  if (options.crop) {
    query.supportedCrops = { $in: [options.crop, 'All'] };
  }
  
  if (options.region) {
    query.supportedRegions = options.region;
  }
  
  return this.find(query).sort({ 'performance.accuracy.overall': -1 });
};

aiModelSchema.statics.findDefault = function(type = null) {
  const query = { 
    'status.isDefault': true,
    'status.isActive': true
  };
  
  if (type) {
    query.type = type;
  }
  
  return this.findOne(query);
};

aiModelSchema.statics.findBest = function(crop, region = null) {
  const query = {
    'status.isActive': true,
    'deprecation.isDeprecated': false,
    supportedCrops: { $in: [crop, 'All'] }
  };
  
  if (region) {
    query.supportedRegions = region;
  }
  
  return this.find(query)
    .sort({ 
      'performance.accuracy.overall': -1,
      'performance.statistics.totalPredictions': -1
    })
    .limit(5);
};

aiModelSchema.statics.getPerformanceStats = function() {
  return this.aggregate([
    { $match: { 'status.isActive': true } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        averageAccuracy: { $avg: '$performance.accuracy.overall' },
        totalPredictions: { $sum: '$performance.statistics.totalPredictions' },
        averageRating: { $avg: '$performance.userRatings.averageRating' }
      }
    }
  ]);
};

// Pre-save middleware
aiModelSchema.pre('save', function(next) {
  // Ensure only one default model per type
  if (this.status.isDefault && this.isModified('status.isDefault')) {
    this.constructor.updateMany(
      { type: this.type, _id: { $ne: this._id } },
      { 'status.isDefault': false }
    ).exec();
  }
  
  next();
});

// Pre-remove middleware
aiModelSchema.pre('remove', function(next) {
  // If removing a default model, set another as default
  if (this.status.isDefault) {
    this.constructor.findOneAndUpdate(
      { 
        type: this.type,
        'status.isActive': true,
        _id: { $ne: this._id }
      },
      { 'status.isDefault': true }
    ).exec();
  }
  
  next();
});

const AiModel = mongoose.model('AiModel', aiModelSchema);

export default AiModel;