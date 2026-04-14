import mongoose from 'mongoose';

const fieldSchema = new mongoose.Schema({
  // User reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },

  // Basic field information
  name: {
    type: String,
    required: [true, 'Field name is required'],
    trim: true,
    maxLength: [100, 'Field name cannot exceed 100 characters']
  },

  description: {
    type: String,
    maxLength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },

  // Location information
  location: {
    // Geographic coordinates
    coordinates: {
      latitude: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90'],
        default: null
      },
      longitude: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180'],
        default: null
      }
    },

    // Administrative location
    address: {
      village: {
        type: String,
        trim: true,
        default: ''
      },
      district: {
        type: String,
        trim: true,
        default: ''
      },
      state: {
        type: String,
        trim: true,
        default: ''
      },
      pincode: {
        type: String,
        trim: true,
        default: ''
      },
      country: {
        type: String,
        trim: true,
        default: 'India'
      }
    },

    // GeoJSON for advanced mapping (optional)
    geoJson: {
      type: {
        type: String,
        enum: ['Point', 'Polygon'],
        default: 'Point'
      },
      coordinates: {
        type: mongoose.Schema.Types.Mixed,
        default: []
      }
    }
  },

  // Physical characteristics
  area: {
    total: {
      type: Number,
      required: [true, 'Total area is required'],
      min: [0.01, 'Area must be at least 0.01 hectares']
    },
    cultivable: {
      type: Number,
      min: 0,
      validate: {
        validator: function(value) {
          return value <= this.area.total;
        },
        message: 'Cultivable area cannot exceed total area'
      }
    },
    unit: {
      type: String,
      enum: ['hectares', 'acres', 'bigha', 'kanal'],
      default: 'hectares'
    }
  },

  // Soil health data
  soilHealth: {
    // Basic soil properties
    pH: {
      type: Number,
      min: 0,
      max: 14,
      default: null
    },
    organicCarbon: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    electricalConductivity: {
      type: Number,
      min: 0,
      default: null
    },

    // Nutrient content (in kg/ha)
    nutrients: {
      nitrogen: {
        type: Number,
        min: 0,
        default: null
      },
      phosphorus: {
        type: Number,
        min: 0,
        default: null
      },
      potassium: {
        type: Number,
        min: 0,
        default: null
      },
      sulfur: {
        type: Number,
        min: 0,
        default: null
      }
    },

    // Micronutrients (in ppm)
    micronutrients: {
      zinc: {
        type: Number,
        min: 0,
        default: null
      },
      iron: {
        type: Number,
        min: 0,
        default: null
      },
      manganese: {
        type: Number,
        min: 0,
        default: null
      },
      copper: {
        type: Number,
        min: 0,
        default: null
      },
      boron: {
        type: Number,
        min: 0,
        default: null
      }
    },

    // Soil test metadata
    lastTested: {
      type: Date,
      default: null
    },
    testingLab: {
      type: String,
      default: ''
    },
    soilType: {
      type: String,
      enum: ['Alluvial', 'Black', 'Red', 'Laterite', 'Arid', 'Saline', 'Peaty', 'Forest'],
      default: null
    },
    texture: {
      type: String,
      enum: ['Sandy', 'Clay', 'Loamy', 'Silty', 'Sandy Loam', 'Clay Loam', 'Silty Loam'],
      default: null
    }
  },

  // Crop history and rotation
  cropHistory: [{
    year: {
      type: Number,
      required: true,
      min: 2000,
      max: new Date().getFullYear() + 1
    },
    season: {
      type: String,
      enum: ['Kharif', 'Rabi', 'Zaid', 'Perennial'],
      required: true
    },
    cropType: {
      type: String,
      required: true
    },
    variety: {
      type: String,
      default: ''
    },
    yield: {
      type: Number,
      min: 0,
      default: null
    },
    yieldUnit: {
      type: String,
      enum: ['tons/ha', 'quintal/acre', 'kg/bigha'],
      default: 'tons/ha'
    },
    notes: {
      type: String,
      maxLength: 200,
      default: ''
    }
  }],

  // Irrigation and water management
  irrigation: {
    source: {
      type: String,
      enum: ['Rain-fed', 'Tube well', 'Canal', 'Bore well', 'River', 'Pond', 'Mixed'],
      default: 'Rain-fed'
    },
    type: {
      type: String,
      enum: ['None', 'Flood', 'Sprinkler', 'Drip', 'Furrow', 'Mixed'],
      default: 'None'
    },
    waterQuality: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Unknown'],
      default: 'Unknown'
    },
    efficiency: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    }
  },

  // Infrastructure and equipment
  infrastructure: {
    farmHouse: {
      type: Boolean,
      default: false
    },
    warehouse: {
      type: Boolean,
      default: false
    },
    coldStorage: {
      type: Boolean,
      default: false
    },
    machinery: [{
      type: {
        type: String,
        enum: ['Tractor', 'Harvester', 'Seeder', 'Sprayer', 'Tiller', 'Pump', 'Other']
      },
      model: String,
      year: Number,
      condition: {
        type: String,
        enum: ['Excellent', 'Good', 'Fair', 'Poor']
      }
    }]
  },

  // Environmental factors
  environment: {
    slope: {
      type: String,
      enum: ['Flat', 'Gentle', 'Moderate', 'Steep'],
      default: 'Flat'
    },
    drainage: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Water-logged'],
      default: 'Good'
    },
    erosionRisk: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low'
    },
    climateZone: {
      type: String,
      default: ''
    }
  },

  // Current status
  currentCrop: {
    cropType: {
      type: String,
      default: null
    },
    variety: {
      type: String,
      default: ''
    },
    plantingDate: {
      type: Date,
      default: null
    },
    expectedHarvest: {
      type: Date,
      default: null
    },
    stage: {
      type: String,
      enum: ['Fallow', 'Prepared', 'Sown', 'Growing', 'Flowering', 'Mature', 'Harvested'],
      default: 'Fallow'
    }
  },

  // Field metadata
  tags: [{
    type: String,
    trim: true
  }],

  notes: {
    type: String,
    maxLength: 1000,
    default: ''
  },

  isActive: {
    type: Boolean,
    default: true
  },

  isOrganic: {
    type: Boolean,
    default: false
  },

  certification: {
    organic: {
      certified: {
        type: Boolean,
        default: false
      },
      certifyingBody: {
        type: String,
        default: ''
      },
      validUntil: {
        type: Date,
        default: null
      }
    }
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
fieldSchema.index({ user: 1, isActive: 1 });
fieldSchema.index({ 'location.coordinates.latitude': 1, 'location.coordinates.longitude': 1 });
fieldSchema.index({ 'location.address.state': 1, 'location.address.district': 1 });
fieldSchema.index({ 'currentCrop.cropType': 1 });
fieldSchema.index({ 'area.total': 1 });
fieldSchema.index({ createdAt: -1 });

// GeoSpatial index for location-based queries
fieldSchema.index({ 'location.geoJson': '2dsphere' });

// Virtual for calculating field utilization
fieldSchema.virtual('utilizationPercentage').get(function() {
  if (this.area.cultivable && this.area.total) {
    return Math.round((this.area.cultivable / this.area.total) * 100);
  }
  return 0;
});

// Virtual for getting the latest soil test age
fieldSchema.virtual('soilTestAge').get(function() {
  if (this.soilHealth.lastTested) {
    const daysDiff = Math.floor((Date.now() - this.soilHealth.lastTested) / (1000 * 60 * 60 * 24));
    return daysDiff;
  }
  return null;
});

// Virtual for current crop duration
fieldSchema.virtual('currentCropAge').get(function() {
  if (this.currentCrop.plantingDate) {
    const daysDiff = Math.floor((Date.now() - this.currentCrop.plantingDate) / (1000 * 60 * 60 * 24));
    return daysDiff;
  }
  return null;
});

// Instance methods
fieldSchema.methods.addCropHistory = function(cropData) {
  this.cropHistory.push(cropData);
  this.cropHistory.sort((a, b) => b.year - a.year); // Sort by year descending
  return this.save();
};

fieldSchema.methods.updateSoilHealth = function(soilData) {
  this.soilHealth = { ...this.soilHealth, ...soilData };
  this.soilHealth.lastTested = new Date();
  return this.save();
};

fieldSchema.methods.updateCurrentCrop = function(cropData) {
  this.currentCrop = { ...this.currentCrop, ...cropData };
  return this.save();
};

fieldSchema.methods.harvestCurrentCrop = function(yieldData) {
  if (this.currentCrop.cropType) {
    // Add to crop history
    this.cropHistory.push({
      year: new Date().getFullYear(),
      season: this.getCurrentSeason(),
      cropType: this.currentCrop.cropType,
      variety: this.currentCrop.variety,
      yield: yieldData.yield,
      yieldUnit: yieldData.yieldUnit || 'tons/ha',
      notes: yieldData.notes || ''
    });

    // Reset current crop
    this.currentCrop = {
      cropType: null,
      variety: '',
      plantingDate: null,
      expectedHarvest: null,
      stage: 'Fallow'
    };
  }
  return this.save();
};

fieldSchema.methods.getCurrentSeason = function() {
  const month = new Date().getMonth() + 1;
  if (month >= 6 && month <= 10) return 'Kharif';
  if (month >= 11 || month <= 3) return 'Rabi';
  return 'Zaid';
};

// Static methods
fieldSchema.statics.findByUser = function(userId, options = {}) {
  const query = { user: userId, isActive: true };
  
  if (options.hasCurrentCrop) {
    query['currentCrop.cropType'] = { $ne: null };
  }
  
  return this.find(query).sort({ createdAt: -1 });
};

fieldSchema.statics.findNearby = function(latitude, longitude, maxDistance = 10000) {
  return this.find({
    'location.geoJson': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true
  });
};

fieldSchema.statics.getStatsByUser = function(userId) {
  return this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), isActive: true } },
    {
      $group: {
        _id: null,
        totalFields: { $sum: 1 },
        totalArea: { $sum: '$area.total' },
        cultivableArea: { $sum: '$area.cultivable' },
        organicFields: { $sum: { $cond: ['$isOrganic', 1, 0] } },
        fieldsWithCurrentCrop: {
          $sum: {
            $cond: [{ $ne: ['$currentCrop.cropType', null] }, 1, 0]
          }
        }
      }
    }
  ]);
};

// Pre-save middleware
fieldSchema.pre('save', function(next) {
  // Set cultivable area to total area if not specified
  if (!this.area.cultivable && this.area.total) {
    this.area.cultivable = this.area.total;
  }

  // Create GeoJSON point if coordinates are provided
  if (this.location.coordinates.latitude && this.location.coordinates.longitude) {
    this.location.geoJson = {
      type: 'Point',
      coordinates: [this.location.coordinates.longitude, this.location.coordinates.latitude]
    };
  }

  next();
});

const Field = mongoose.model('Field', fieldSchema);

export default Field;