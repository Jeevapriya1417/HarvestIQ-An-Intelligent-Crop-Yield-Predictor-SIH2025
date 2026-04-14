/**
 * Check AI Models in MongoDB
 * Run this to verify your ML models are properly configured
 * Usage: node checkModels.js
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

// Check AI Models
const checkModels = async () => {
  try {
    await connectDB();

    console.log('\n' + '='.repeat(70));
    console.log('  🤖 HarvestIQ AI Models Status Report');
    console.log('='.repeat(70));

    // Get all models
    const models = await AiModel.find({}).sort({ createdAt: -1 });

    if (models.length === 0) {
      console.log('\n⚠️  No AI models found in database!');
      console.log('\n💡 Run this to create one:');
      console.log('   node seedAiModel.js');
      console.log('='.repeat(70));
      process.exit(0);
    }

    console.log(`\n📊 Found ${models.length} AI Model(s):\n`);

    models.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`);
      console.log('   ' + '-'.repeat(60));
      console.log('   ID:', model._id);
      console.log('   Type:', model.type);
      console.log('   Version:', model.version);
      console.log('   Crop Type:', model.cropType);
      console.log('   Region:', model.region);
      console.log('   Active:', model.isActive ? '✅ Yes' : '❌ No');
      console.log('   Accuracy:', model.accuracy ? model.accuracy + '%' : 'Not set');
      console.log('   Created:', model.createdAt.toLocaleString());
      
      if (model.configuration) {
        console.log('   Configuration:');
        console.log('     - Service URL:', model.configuration.serviceUrl || 'Not set');
        console.log('     - Timeout:', model.configuration.timeout || 'Not set');
      }
      console.log('');
    });

    // Check for Python ML model
    const pythonModel = models.find(m => m.type === 'python-ml' && m.isActive);
    
    console.log('='.repeat(70));
    
    if (pythonModel) {
      console.log('✅ Python ML Model is REGISTERED and ACTIVE');
      console.log('   Model:', pythonModel.name);
      console.log('   Service URL:', pythonModel.configuration?.serviceUrl || 'http://localhost:8000');
      console.log('\n💡 Backend will use Python ML for predictions!');
    } else {
      console.log('❌ Python ML Model is NOT available');
      console.log('\n💡 Backend will use JavaScript fallback');
      console.log('\nTo enable Python ML:');
      console.log('   1. Start FastAPI: cd "Py model" && python harvest_fastapi.py');
      console.log('   2. Verify: curl http://localhost:8000/health');
      console.log('   3. Seed model: node seedAiModel.js');
    }
    
    console.log('='.repeat(70));
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error checking models:', error);
    process.exit(1);
  }
};

// Run check
checkModels();
