#!/usr/bin/env python3

import json
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "message": "Simple test API is running"})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        print(f"Received data: {data}")
        
        # Simple calculation based on input
        crop_type = data.get('crop_type', 'Wheat')
        farm_area = float(data.get('farm_area', 1.0))
        rainfall = float(data.get('weather_data', {}).get('annual_rainfall_mm', 1000))
        ph = float(data.get('soil_data', {}).get('ph_level', 6.5))
        
        # Simple yield calculation
        base_yield = 4.5  # Base yield for wheat
        yield_factor = 1.0
        
        if 6.0 <= ph <= 7.5:
            yield_factor *= 1.1
        if 400 <= rainfall <= 1000:
            yield_factor *= 1.1
            
        expected_yield = base_yield * yield_factor
        total_yield = expected_yield * farm_area
        
        result = {
            "success": True,
            "prediction": {
                "expected_yield": round(expected_yield, 2),
                "yield_per_hectare": round(expected_yield, 2),
                "total_yield": round(total_yield, 2),
                "confidence": 85,
                "unit": "kg/ha"
            },
            "input_summary": {
                "crop": crop_type,
                "area": farm_area,
                "rainfall": rainfall,
                "ph": ph
            }
        }
        
        print(f"Sending result: {result}")
        return jsonify(result)
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    print("🧪 Starting Simple Test API...")
    app.run(host='0.0.0.0', port=8001, debug=True)