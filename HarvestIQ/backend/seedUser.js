import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

// Load environment variables
dotenv.config();

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findByEmail('sample@gmail.com');
    if (existingUser) {
      console.log('Test user already exists');
      process.exit(0);
    }

    // Create test user
    const testUser = new User({
      fullName: 'Santhosh Kumar',
      email: 'sample@gmail.com',
      password: '141709Sj',
      role: 'farmer',
      preferences: {
        language: 'en',
        theme: 'light',
        notifications: {
          email: true,
          weather: true,
          market: true
        }
      },
      profile: {
        location: {
          state: 'Punjab',
          district: 'Amritsar'
        },
        farmingExperience: 5,
        farmSize: 10.5,
        primaryCrops: ['Wheat', 'Rice'],
        farmingType: 'conventional'
      }
    });

    await testUser.save();
    console.log('Test user created successfully!');
    console.log('Email: sample@gmail.com');
    console.log('Password: 141709Sj');
    
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    mongoose.connection.close();
  }
};

createTestUser();