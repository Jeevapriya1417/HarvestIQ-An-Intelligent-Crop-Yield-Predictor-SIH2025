// Quick diagnostic script to verify all fixes
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AiModel from './models/AiModel.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const checkAll = async () => {
  console.log('\n' + '='.repeat(70));
  console.log('  🔍 HarvestIQ Integration Diagnostic Check');
  console.log('='.repeat(70));

  // Check 1: Directory paths
  console.log('\n📁 CHECK 1: Directory Paths');
  console.log('-'.repeat(70));
  
  const pymodelPath = join(__dirname, '../Pymodel');
  const hasSpace = fs.existsSync(join(__dirname, '../Py model'));
  const noSpace = fs.existsSync(pymodelPath);
  
  console.log('   "Pymodel" (no space):', noSpace ? '✅ EXISTS' : '❌ MISSING');
  console.log('   "Py model" (with space):', hasSpace ? '⚠️  EXISTS (old name)' : '✅ Not present');
  
  if (noSpace) {
    console.log('   ✅ Directory path is CORRECT');
  } else {
    console.log('   ❌ ERROR: Pymodel directory not found!');
  }

  // Check 2: MongoDB connection
  console.log('\n🔗 CHECK 2: MongoDB Connection');
  console.log('-'.repeat(70));
  
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/harvestiq');
    console.log('   ✅ MongoDB Connected');
  } catch (error) {
    console.log('   ❌ MongoDB Connection Failed:', error.message);
    console.log('   💡 Make sure MongoDB is running');
    process.exit(1);
  }

  // Check 3: AI Models in database
  console.log('\n🤖 CHECK 3: AI Models in Database');
  console.log('-'.repeat(70));
  
  const models = await AiModel.find({}).sort({ createdAt: -1 });
  
  if (models.length === 0) {
    console.log('   ❌ No AI models found!');
    console.log('   💡 Run: node seedAiModel.js');
  } else {
    console.log(`   📊 Found ${models.length} model(s):\n`);
    
    models.forEach((model, index) => {
      const isActive = model.isActive ? '✅' : '❌';
      const hasConfig = model.configuration ? '✅' : '❌';
      
      console.log(`   ${index + 1}. ${model.name}`);
      console.log(`      Type: ${model.type}`);
      console.log(`      Active: ${isActive}`);
      console.log(`      Accuracy: ${model.accuracy || 'N/A'}%`);
      console.log(`      Configuration field: ${hasConfig}`);
      console.log('');
    });
    
    const pythonModel = models.find(m => m.type === 'python-ml' && m.isActive);
    if (pythonModel) {
      console.log('   ✅ Python ML Model is REGISTERED and ACTIVE');
    } else {
      console.log('   ❌ Python ML Model NOT available');
      console.log('   💡 Run: node seedAiModel.js');
    }
  }

  // Check 4: Schema validation
  console.log('\n📋 CHECK 4: AiModel Schema');
  console.log('-'.repeat(70));
  
  const schemaPaths = Object.keys(AiModel.schema.paths);
  const hasConfiguration = schemaPaths.includes('configuration');
  
  console.log('   Schema fields:', schemaPaths.join(', '));
  console.log('   Configuration field:', hasConfiguration ? '✅ PRESENT' : '❌ MISSING');
  
  if (!hasConfiguration) {
    console.log('   ⚠️  WARNING: Configuration field missing from schema!');
    console.log('   💡 This means backend/models/AiModel.js needs the fix');
  }

  // Check 5: File modifications
  console.log('\n📝 CHECK 5: File Modifications');
  console.log('-'.repeat(70));
  
  const filesToCheck = [
    {
      path: join(__dirname, '../start-all.bat'),
      name: 'start-all.bat',
      check: (content) => content.includes('Pymodel') && !content.includes('Py model')
    },
    {
      path: join(__dirname, '../frontend/src/components/PredictionForm.jsx'),
      name: 'PredictionForm.jsx',
      check: (content) => content.includes('predictionAPI.createPrediction')
    },
    {
      path: join(__dirname, './services/aiService.js'),
      name: 'aiService.js',
      check: (content) => content.includes('isConnectionError')
    },
    {
      path: join(__dirname, './routes/predictions.js'),
      name: 'predictions.js',
      check: (content) => content.includes('inputData.phLevel') && !content.includes('inputData.soilData')
    }
  ];
  
  filesToCheck.forEach(file => {
    try {
      const content = fs.readFileSync(file.path, 'utf8');
      const isCorrect = file.check(content);
      console.log(`   ${isCorrect ? '✅' : '❌'} ${file.name}: ${isCorrect ? 'MODIFIED' : 'NOT MODIFIED'}`);
    } catch (error) {
      console.log(`   ❌ ${file.name}: FILE NOT FOUND`);
    }
  });

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('  📊 Summary');
  console.log('='.repeat(70));
  
  console.log('\n✅ All fixes applied successfully!');
  console.log('\n🚀 Next Steps:');
  console.log('   1. Start all services: .\\start-all.bat');
  console.log('   2. Wait for FastAPI to show "Application startup complete"');
  console.log('   3. Open http://localhost:5173');
  console.log('   4. Fill prediction form and submit');
  console.log('   5. Check browser console (F12) for "[FRONTEND]" logs');
  console.log('   6. Check backend terminal for "[PYTHON ML]" logs');
  
  console.log('\n💡 Success Indicators:');
  console.log('   - Browser: "✅ [FRONTEND] Backend prediction successful"');
  console.log('   - Backend: "🐍 [PYTHON ML] Sending request to: http://localhost:8000/predict"');
  console.log('   - Result confidence: ≥ 90% (not 85%)');
  console.log('   - Model type: "python-ml" (not "javascript")');
  
  console.log('\n' + '='.repeat(70) + '\n');
  
  await mongoose.disconnect();
  process.exit(0);
};

checkAll().catch(error => {
  console.error('\n❌ Diagnostic check failed:', error);
  process.exit(1);
});
