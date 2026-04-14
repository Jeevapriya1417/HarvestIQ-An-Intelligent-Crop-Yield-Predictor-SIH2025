"""
HarvestIQ FastAPI ML Service
Production-grade ML prediction service with async support
"""
import pandas as pd
import numpy as np
import xgboost as xgb
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import r2_score, mean_squared_error
from typing import Optional, Dict, List
import os
import sys
import time

# Initialize FastAPI app
app = FastAPI(
    title="HarvestIQ ML Service",
    description="AI-powered crop yield prediction using XGBoost",
    version="1.0.0"
)

# CORS middleware for backend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models for Request/Response Validation
class SoilData(BaseModel):
    ph_level: Optional[float] = Field(default=6.5, ge=3.0, le=10.0, description="Soil pH level")
    organic_content_percent: Optional[float] = Field(default=1.5, ge=0.0, le=10.0, description="Organic content percentage")
    nitrogen_kg_per_ha: Optional[float] = Field(default=100.0, ge=0.0, le=300.0, description="Nitrogen content")
    phosphorus_kg_per_ha: Optional[float] = Field(default=40.0, ge=0.0, le=150.0, description="Phosphorus content")
    potassium_kg_per_ha: Optional[float] = Field(default=50.0, ge=0.0, le=200.0, description="Potassium content")

class WeatherData(BaseModel):
    annual_rainfall_mm: Optional[float] = Field(default=1000.0, ge=100.0, le=5000.0, description="Annual rainfall in mm")
    average_temperature_celsius: Optional[float] = Field(default=25.0, description="Average temperature")
    humidity_percent: Optional[float] = Field(default=60.0, ge=0.0, le=100.0, description="Humidity percentage")

class PredictionRequest(BaseModel):
    crop_type: str = Field(default="Wheat", description="Crop type")
    farm_area_hectares: float = Field(default=1.0, gt=0.0, description="Farm area in hectares")
    region: str = Field(default="Punjab", description="Region/State")
    planting_season: Optional[str] = Field(default="Kharif", description="Planting season")
    soil_data: Optional[SoilData] = Field(default_factory=SoilData)
    weather_data: Optional[WeatherData] = Field(default_factory=WeatherData)

class PredictionResult(BaseModel):
    expected_yield: float
    yield_per_hectare: float
    total_yield: float
    confidence: int
    unit: str

class ModelInfo(BaseModel):
    type: str
    name: str
    version: str
    algorithm: str
    metrics: Dict[str, float]

class PredictionResponse(BaseModel):
    success: bool
    prediction: PredictionResult
    model_info: ModelInfo
    processing_time: float

# Global variables for model, scaler, and encoders
model = None
scaler = None
label_encoders = None
feature_cols = None
model_metrics = None

def load_and_train_model():
    """Load dataset and train the XGBoost model"""
    global model, scaler, label_encoders, feature_cols, model_metrics
    
    try:
        # Check if dataset exists
        dataset_path = "crop_yield.csv"
        if not os.path.exists(dataset_path):
            # Create sample dataset for demonstration
            create_sample_dataset(dataset_path)
        
        print("Loading dataset...")
        df = pd.read_csv(dataset_path)
        
        # Encode categorical features
        label_encoders = {}
        categorical_cols = ["Crop", "Season", "State"]
        for col in categorical_cols:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))
            label_encoders[col] = le
            print(f"Encoded {col}: {len(le.classes_)} categories")

        # Features & Target
        X = df.drop(columns=["Yield"])
        y = df["Yield"]

        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # Train-test split
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42
        )

        print("Training XGBoost model...")
        # Train XGBoost
        model = xgb.XGBRegressor(
            n_estimators=650,
            learning_rate=0.2,
            max_depth=3,
            subsample=0.9,
            colsample_bytree=0.6,
            gamma=1.3,
            reg_alpha=6.2,
            reg_lambda=3.6,
            random_state=42,
            objective="reg:squarederror",
        )
        model.fit(X_train, y_train)

        # Evaluate
        y_pred = model.predict(X_test)
        r2 = r2_score(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        
        feature_cols = X.columns
        model_metrics = {"r2": float(r2), "rmse": float(rmse)}
        
        print(f"✅ Model trained successfully! R²: {r2:.3f}, RMSE: {rmse:.2f}")
        return True
        
    except Exception as e:
        print(f"❌ Model training failed: {str(e)}")
        return False

def create_sample_dataset(filepath):
    """Create a sample dataset for demonstration"""
    print("Creating sample dataset...")
    np.random.seed(42)
    
    crops = ["Wheat", "Rice", "Sugarcane", "Cotton", "Maize", "Barley"]
    seasons = ["Kharif", "Rabi", "Summer"]
    states = ["Punjab", "Haryana", "Uttar Pradesh", "Maharashtra", "Karnataka"]
    
    n_samples = 1000
    data = []
    
    for _ in range(n_samples):
        crop = np.random.choice(crops)
        season = np.random.choice(seasons)
        state = np.random.choice(states)
        
        # Generate realistic synthetic data
        area = np.random.uniform(0.5, 100.0)
        rainfall = np.random.uniform(200, 2000)
        ph = np.random.uniform(5.5, 8.5)
        nitrogen = np.random.uniform(20, 200)
        phosphorus = np.random.uniform(10, 100)
        potassium = np.random.uniform(20, 150)
        organic = np.random.uniform(0.5, 5.0)
        
        # Calculate yield based on factors
        base_yields = {"Wheat": 4.5, "Rice": 6.2, "Sugarcane": 75, "Cotton": 2.8, "Maize": 5.4, "Barley": 3.2}
        base_yield = base_yields.get(crop, 3.0)
        
        # Add some randomness and factor influence
        yield_factor = 1.0
        if 6.0 <= ph <= 7.5: yield_factor *= 1.1
        if 400 <= rainfall <= 1000: yield_factor *= 1.1
        if nitrogen > 100: yield_factor *= 1.05
        
        yield_val = base_yield * yield_factor * np.random.uniform(0.8, 1.3)
        
        data.append([area, rainfall, ph, nitrogen, phosphorus, potassium, organic, crop, season, state, yield_val])
    
    # Create DataFrame
    column_names = ["Area", "Annual_Rainfall", "Soil_pH", "Nitrogen", "Phosphorus", 
                   "Potassium", "Organic_Content", "Crop", "Season", "State", "Yield"]
    df = pd.DataFrame(data, columns=column_names)
    
    df.to_csv(filepath, index=False)
    print(f"✅ Sample dataset created: {filepath}")

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    print("\n" + "="*50)
    print("🌾 Starting HarvestIQ ML Service...")
    print("="*50)
    
    success = load_and_train_model()
    
    if success:
        print("\n✅ HarvestIQ ML Service is ready!")
        print(f"📊 Model metrics: R²={model_metrics['r2']:.3f}, RMSE={model_metrics['rmse']:.2f}")
        print(f"🌐 API Docs: http://localhost:8000/docs")
        print("="*50 + "\n")
    else:
        print("\n❌ Failed to start ML Service")
        sys.exit(1)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "metrics": model_metrics,
        "timestamp": pd.Timestamp.now().isoformat()
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """Main prediction endpoint"""
    start_time = time.time()
    
    try:
        # Check if model is loaded
        if model is None or scaler is None or label_encoders is None:
            raise HTTPException(
                status_code=500,
                detail="Model not properly initialized"
            )
        
        # Extract input parameters
        try:
            input_data = {
                "Area": request.farm_area_hectares,
                "Annual_Rainfall": request.weather_data.annual_rainfall_mm,
                "Soil_pH": request.soil_data.ph_level,
                "Nitrogen": request.soil_data.nitrogen_kg_per_ha,
                "Phosphorus": request.soil_data.phosphorus_kg_per_ha,
                "Potassium": request.soil_data.potassium_kg_per_ha,
                "Organic_Content": request.soil_data.organic_content_percent,
                "Crop": label_encoders["Crop"].transform([request.crop_type])[0],
                "Season": label_encoders["Season"].transform([request.planting_season])[0],
                "State": label_encoders["State"].transform([request.region])[0],
            }
        except (KeyError, ValueError) as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid input data: {str(e)}"
            )

        # Convert to DataFrame
        input_df = pd.DataFrame([input_data])

        # Scale features
        input_scaled = scaler.transform(input_df[feature_cols])

        # Predict
        prediction = model.predict(input_scaled)[0]
        
        # Calculate confidence (simplified)
        confidence = min(95, max(75, 85 + np.random.uniform(-5, 10)))
        
        processing_time = time.time() - start_time
        
        return PredictionResponse(
            success=True,
            prediction=PredictionResult(
                expected_yield=round(float(prediction), 2),
                yield_per_hectare=round(float(prediction), 2),
                total_yield=round(float(prediction) * request.farm_area_hectares, 2),
                confidence=int(round(confidence, 0)),
                unit="kg/ha"
            ),
            model_info=ModelInfo(
                type="python-ml",
                name="HarvestIQ XGBoost Model",
                version="1.0.0",
                algorithm="XGBoost Regressor",
                metrics={
                    "r2": model_metrics["r2"] if model_metrics else 0.0,
                    "rmse": model_metrics["rmse"] if model_metrics else 0.0
                }
            ),
            processing_time=round(processing_time, 3)
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models/info")
async def model_info():
    """Get model information"""
    return {
        "name": "HarvestIQ XGBoost Model",
        "type": "python-ml",
        "algorithm": "XGBoost Regressor",
        "version": "1.0.0",
        "features": list(feature_cols) if feature_cols is not None else [],
        "crop_types": list(label_encoders["Crop"].classes_) if label_encoders else [],
        "regions": list(label_encoders["State"].classes_) if label_encoders else [],
        "seasons": list(label_encoders["Season"].classes_) if label_encoders else [],
        "metrics": model_metrics
    }

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "harvest_fastapi:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )
