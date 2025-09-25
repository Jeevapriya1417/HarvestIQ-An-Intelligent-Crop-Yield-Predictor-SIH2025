import sys
import json

print("Arguments received:")
for i, arg in enumerate(sys.argv):
    print(f"  {i}: {repr(arg)}")

if len(sys.argv) > 1:
    try:
        data = json.loads(sys.argv[1])
        print("JSON parsed successfully:")
        print(json.dumps(data, indent=2))
    except Exception as e:
        print(f"JSON parse error: {e}")
        print(f"Raw argument: {repr(sys.argv[1])}")