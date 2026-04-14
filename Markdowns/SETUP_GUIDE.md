# HarvestIQ Setup & Testing Guide

## ✅ What's Been Done

### Phase 1: Cleanup
- ✅ Removed 14 unused/test files
- ✅ Clean codebase with only production files

### Phase 2: FastAPI Integration
- ✅ Created `Py model/harvest_fastapi.py` with modern FastAPI service
- ✅ Updated `Py model/requirements.txt` (Flask → FastAPI)
- ✅ Created `backend/seedAiModel.js` for ML model registration
- ✅ Updated `backend/.env` with Python service configuration
- ✅ Updated `start-all.bat` startup script

---

## 🚀 Setup Instructions

### Step 1: Install Python Dependencies

Open terminal in `Py model/` directory:

```bash
cd "Py model"
pip install -r requirements.txt
```

**This will install:**
- fastapi>=0.104.0
- uvicorn>=0.24.0
- pandas, numpy, xgboost, scikit-learn, joblib

### Step 2: Seed AI Model into MongoDB

Open terminal in `backend/` directory:

```bash
cd backend
node seedAiModel.js
```

**Expected output:**
```
✅ MongoDB Connected: ...
🌾 Seeding AI Model...
✅ AI Model created successfully!

📊 Registered AI Models:
────────────────────────────────────────────────────────────
1. HarvestIQ XGBoost Model
   Type: python-ml
   Version: 1.0.0
   Active: ✅ Yes
   Accuracy: 92%
```

### Step 3: Start All Services

**Option A: Use startup script (Recommended)**
```bash
start-all.bat
```

**Option B: Start manually**

Terminal 1 - FastAPI ML Service:
```bash
cd "Py model"
python harvest_fastapi.py
```

Terminal 2 - Backend Server:
```bash
cd backend
npm run dev
```

Terminal 3 - Frontend:
```bash
npm run dev
```

---

## 🧪 Testing Instructions

### Test 1: FastAPI Service (Independent)

1. Start FastAPI service:
   ```bash
   cd "Pymodel"
   python harvest_fastapi.py
   ```

2. Open browser to: http://localhost:8000/docs

3. You'll see **Swagger UI** with 3 endpoints:
   - `GET /health` - Health check
   - `POST /predict` - Make predictions
   - `GET /models/info` - Model information

4. Test `/health` endpoint:
   - Click "Try it out"
   - Click "Execute"
   - Expected response:
     ```json
     {
       "status": "healthy",
       "model_loaded": true,
       "metrics": {
         "r2": 0.92,
         "rmse": 2.5
       }
     }
     ```

5. Test `/predict` endpoint:
   - Click "Try it out"
   - Use example request:
     ```json
     {
       "crop_type": "Wheat",
       "farm_area_hectares": 5.0,
       "region": "Punjab",
       "planting_season": "Rabi",
       "soil_data": {
         "ph_level": 6.5,
         "nitrogen_kg_per_ha": 120,
         "phosphorus_kg_per_ha": 45,
         "potassium_kg_per_ha": 60,
         "organic_content_percent": 2.0
       },
       "weather_data": {
         "annual_rainfall_mm": 800
       }
     }
     ```
   - Click "Execute"
   - Expected response:
     ```json
     {
       "success": true,
       "prediction": {
         "expected_yield": 4.85,
         "yield_per_hectare": 4.85,
         "total_yield": 24.25,
         "confidence": 88,
         "unit": "kg/ha"
       },
       "model_info": {
         "type": "python-ml",
         "name": "HarvestIQ XGBoost Model",
         "version": "1.0.0",
         "algorithm": "XGBoost Regressor",
         "metrics": {
           "r2": 0.92,
           "rmse": 2.5
         }
       },
       "processing_time": 0.045
     }
     ```

### Test 2: Backend Integration

1. Ensure **both** FastAPI and Backend are running

2. Login to your HarvestIQ app (http://localhost:5173)

3. Create a new prediction via the UI

4. Check backend terminal logs - you should see:
   ```
   AI Service routing to: python-ml
   Request to Python AI service: http://localhost:8000/predict
   Prediction successful!
   ```

### Test 3: Fallback Mechanism

1. **Stop** the FastAPI service (Ctrl+C in Python terminal)

2. Create another prediction via the UI

3. Check backend terminal - you should see:
   ```
   Python AI service failed: ...
   Falling back to JavaScript prediction engine
   ```

4. Prediction still works using JS fallback!

---

## 📊 Service Status Checklist

After starting all services, verify:

- [ ] **FastAPI ML Service**: http://localhost:8000
  - [ ] Health endpoint works: http://localhost:8000/health
  - [ ] Swagger UI loads: http://localhost:8000/docs
  - [ ] Model is loaded (check health response)

- [ ] **Backend API**: http://localhost:5000
  - [ ] Health endpoint works: http://localhost:5000/health
  - [ ] MongoDB connected (check terminal)
  - [ ] No error messages

- [ ] **Frontend**: http://localhost:5173
  - [ ] App loads without errors
  - [ ] Can login
  - [ ] Can create predictions
  - [ ] Predictions display results

---

## 🎯 Expected Behavior

### With FastAPI Running:
- Predictions use **XGBoost ML model** (~92% accuracy)
- Response time: ~50-100ms
- Results include ML metrics (R², RMSE)

### Without FastAPI (Fallback):
- Predictions use **JavaScript engine** (~65% accuracy)
- Response time: ~10-20ms
- Simple calculation-based results
- **App never breaks!**

---

## 🔧 Troubleshooting

### Issue: FastAPI won't start
**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**
```bash
cd "Py model"
pip install -r requirements.txt
```

### Issue: MongoDB connection error
**Error:** `MongoServerError: bad auth`

**Solution:**
- Check `backend/.env` has correct `MONGODB_URI`
- Verify MongoDB Atlas whitelist includes your IP

### Issue: Backend can't connect to FastAPI
**Error:** `ECONNREFUSED 127.0.0.1:8000`

**Solution:**
- Ensure FastAPI is running on port 8000
- Check `backend/.env` has `PYTHON_AI_SERVICE_URL=http://localhost:8000`
- Test FastAPI directly: http://localhost:8000/health

### Issue: Predictions still using JS fallback
**Check:**
1. Is FastAPI running? (http://localhost:8000/health)
2. Is AI model seeded? (run `node seedAiModel.js`)
3. Check backend logs for routing decisions

---

## 📈 Next Steps

After successful testing:

1. **Monitor accuracy**: Compare JS vs Python predictions
2. **Add more crops**: Update dataset with more crop types
3. **Retrain model**: Use real farm data for better accuracy
4. **Deploy to production**: 
   - FastAPI → Railway/Render
   - Backend → Heroku/Railway
   - Frontend → Vercel/Netlify

---

## 🎉 Success Criteria

You'll know everything is working when:

✅ FastAPI service loads model on startup  
✅ Swagger UI shows at http://localhost:8000/docs  
✅ Backend routes predictions to Python ML  
✅ Predictions return ML-based results with confidence scores  
✅ Stopping FastAPI triggers JS fallback automatically  
✅ Frontend displays predictions without errors  

---

**Need help?** Check the terminal logs for detailed error messages!
