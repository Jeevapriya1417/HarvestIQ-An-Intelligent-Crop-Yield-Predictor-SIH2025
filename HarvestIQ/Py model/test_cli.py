import subprocess
import json

# Test data
test_data = {
    "crop": "Wheat",
    "area": 5.0,
    "rainfall": 800,
    "ph": 6.5,
    "nitrogen": 100,
    "phosphorus": 40,
    "potassium": 50,
    "organic": 1.5,
    "season": "Kharif",
    "state": "Punjab"
}

# Convert to JSON string
json_string = json.dumps(test_data)
print(f"Testing CLI with data: {json_string}")

# Run the CLI script
try:
    result = subprocess.run([
        'python', 
        'HarvestIQ/Py model/harvest_cli.py', 
        json_string
    ], capture_output=True, text=True, cwd='.')
    
    print("CLI Output:")
    print(result.stdout)
    
    if result.stderr:
        print("CLI Errors:")
        print(result.stderr)
        
except Exception as e:
    print(f"CLI test failed: {e}")