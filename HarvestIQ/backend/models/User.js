import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxLength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ],
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['farmer', 'admin', 'expert'],
    default: 'farmer'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  preferences: {
    language: {
      type: String,
      enum: ['en', 'hi', 'pa'],
      default: 'en'
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      weather: {
        type: Boolean,
        default: true
      },
      market: {
        type: Boolean,
        default: true
      }
    }
  },
  profile: {
    location: {
      state: String,
      district: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    farmingExperience: {
      type: Number,
      min: 0
    },
    farmSize: {
      type: Number,
      min: 0
    },
    primaryCrops: [String],
    farmingType: {
      type: String,
      enum: ['organic', 'conventional', 'mixed'],
      default: 'conventional'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Remove duplicate index definitions
// userSchema.index({ email: 1 }); - Removed to fix duplicate index warning
userSchema.index({ isActive: 1 });

// Virtual for user's prediction count (will be added when we implement predictions)
userSchema.virtual('predictionCount', {
  ref: 'Prediction',
  localField: '_id',
  foreignField: 'user',
  count: true
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to generate user profile data (without sensitive info)
userSchema.methods.getPublicProfile = function() {
  const userObj = this.toObject();
  delete userObj.password;
  return userObj;
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase(), isActive: true });
};

// Static method to find user with password (for authentication)
userSchema.statics.findByEmailWithPassword = function(email) {
  return this.findOne({ 
    email: email.toLowerCase(), 
    isActive: true 
  }).select('+password');
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

const User = mongoose.model('User', userSchema);

export default User;