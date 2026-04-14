/**
 * Seed AI Model into MongoDB
 * Run once to register the Python ML model with the backend
 * Usage: node seedAiModel.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AiModel from './models/AiModel.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Seed AI Model
const seedAiModel = async () => {
  try {
    await connectDB();

    console.log('\n🌾 Seeding AI Model...');

    // Check if model already exists
    const existingModel = await AiModel.findOne({ name: 'HarvestIQ XGBoost Model' });
    
    if (existingModel) {
      console.log('⚠️  AI Model already exists, updating...');
      
      // Update existing model
      existingModel.type = 'python-ml';
      existingModel.version = '1.0.0';
      existingModel.accuracy = 92;
      existingModel.isActive = true;
      existingModel.configuration = {
        serviceUrl: process.env.PYTHON_AI_SERVICE_URL || 'http://localhost:8000',
        timeout: parseInt(process.env.AI_SERVICE_TIMEOUT) || 30000,
        parameters: {}
      };
      
      await existingModel.save();
      console.log('✅ AI Model updated successfully!');
    } else {
      // Create new model
      const aiModel = new AiModel({
        name: 'HarvestIQ XGBoost Model',
        description: 'ML-based crop yield prediction using XGBoost with 92% accuracy',
        version: '1.0.0',
        type: 'python-ml',
        cropType: 'Wheat',
        region: 'all',
        accuracy: 92,
        isActive: true,
        configuration: {
          serviceUrl: process.env.PYTHON_AI_SERVICE_URL || 'http://localhost:8000',
          timeout: parseInt(process.env.AI_SERVICE_TIMEOUT) || 30000,
          parameters: {}
        }
      });

      await aiModel.save();
      console.log('✅ AI Model created successfully!');
    }

    // Display all AI models
    const models = await AiModel.find({});
    console.log('\n📊 Registered AI Models:');
    console.log('─'.repeat(60));
    models.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`);
      console.log(`   Type: ${model.type}`);
      console.log(`   Version: ${model.version}`);
      console.log(`   Active: ${model.isActive ? '✅ Yes' : '❌ No'}`);
      console.log(`   Accuracy: ${model.accuracy || 'N/A'}%`);
      console.log('');
    });

    console.log('─'.repeat(60));
    console.log('✅ Seeding complete!');
    console.log('\n🚀 Next steps:');
    console.log('   1. Start FastAPI service: cd "Py model" && python harvest_fastapi.py');
    console.log('   2. Start backend: npm run dev');
    console.log('   3. Create a prediction - it will use the Python ML model!');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding AI model:', error);
    process.exit(1);
  }
};

// Run seed
seedAiModel();
