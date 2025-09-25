import requests
import json

# Test the health endpoint
try:
    response = requests.get('http://localhost:8000/health')
    print("Health check response:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Health check failed: {e}")

# Test the prediction endpoint
test_data = {
    "crop_type": "Wheat",
    "farm_area": 5.0,
    "weather_data": {
        "annual_rainfall_mm": 800
    },
    "soil_data": {
        "ph_level": 6.5,
        "nitrogen_kg_per_ha": 100,
        "phosphorus_kg_per_ha": 40,
        "potassium_kg_per_ha": 50,
        "organic_content_percent": 1.5
    },
    "region": "Punjab",
    "season": "Kharif"
}

try:
    response = requests.post(
        'http://localhost:8000/predict',
        json=test_data,
        headers={'Content-Type': 'application/json'}
    )
    print("\nPrediction response:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Prediction failed: {e}")