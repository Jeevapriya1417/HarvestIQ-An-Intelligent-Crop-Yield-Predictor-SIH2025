import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Simple CORS setup
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// Simple user schema for testing
const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String
});

const User = mongoose.model('User', userSchema);

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Simple login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // For now, just check if it's our test user
    if (email === 'sample@gmail.com' && password === '141709Sj') {
      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            _id: '12345',
            fullName: 'Santhosh Kumar',
            email: 'sample@gmail.com',
            role: 'farmer',
            location: 'Punjab, India',
            farmSize: '10.5',
            primaryCrop: 'Wheat'
          },
          token: 'test-token-123'
        }
      });
    }
    
    res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update profile endpoint
app.put('/api/auth/profile', (req, res) => {
  try {
    const { fullName, email, location, farmSize, primaryCrop } = req.body;
    
    // Return the updated user data with the new values
    const updatedUser = {
      _id: '12345',
      fullName: fullName || 'Santhosh Kumar',
      email: email || 'sample@gmail.com',
      role: 'farmer',
      location: location || 'Punjab, India',
      farmSize: farmSize || '10.5',
      primaryCrop: primaryCrop || 'Wheat'
    };
    
    // Simulate successful profile update
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Change password endpoint
app.put('/api/auth/change-password', (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Simple validation
    if (currentPassword === '141709Sj' && newPassword && newPassword.length >= 8) {
      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect or new password is too short'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Test Server running on port ${PORT}`);
});