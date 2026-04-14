# 🚀 HarvestIQ Startup Scripts

This directory contains startup scripts to easily launch all HarvestIQ services with proper environment checks and dependency management.

---

## 📋 Available Scripts

### 1. **start-all.bat** (Windows)
Complete startup script for Windows with:
- ✅ Node.js and Python prerequisite checks
- ✅ Automatic dependency installation
- ✅ Service health verification
- ✅ Workspace configuration display
- ✅ Clear service URLs and log information

**Usage:**
```bash
# Navigate to project root
cd C:\Users\YourUsername\Desktop\Programs\HarvestIQ

# Run the script
.\start-all.bat
```

### 2. **start-all.sh** (macOS & Linux)
Complete startup script for Unix-like systems with:
- ✅ Node.js and Python prerequisite checks
- ✅ Automatic dependency installation
- ✅ Terminal tab management (macOS & Linux)
- ✅ Colored output for readability
- ✅ Service health verification

**Usage:**
```bash
# Navigate to project root
cd ~/path/to/HarvestIQ

# Make script executable (first time only)
chmod +x start-all.sh

# Run the script
./start-all.sh
```

---

## 🎯 What Each Script Does

### Pre-flight Checks
Both scripts perform the following checks before starting services:

1. **Prerequisite Verification**
   - ✓ Checks if Node.js is installed
   - ✓ Checks if npm is available
   - ✓ Checks if Python 3 is installed
   - ✓ Provides download links if missing

2. **Dependency Management**
   - ✓ Verifies `frontend/node_modules` exists
   - ✓ Verifies `backend/node_modules` exists
   - ✓ Verifies Python packages installed
   - ✓ Automatically installs missing dependencies

3. **Service Startup** (in order)
   - **Service 1**: FastAPI ML Service (Port 8000)
   - **Service 2**: Express Backend API (Port 5000) - waits 3 seconds
   - **Service 3**: React Frontend Dev (Port 5173) - waits 3 seconds

4. **Success Confirmation**
   - ✓ Displays all running service URLs
   - ✓ Shows workspace folder structure
   - ✓ Provides service management instructions

---

## 🖥️ Platform-Specific Details

### Windows (start-all.bat)

**How it works:**
- Opens 3 new Command Prompt windows, one per service
- Each window runs independently
- Output from each service visible in its window
- Close individual windows to stop specific services
- Close all windows to stop entire application

**Staggered Start:**
- ML Service: Launches immediately
- Backend: Waits 3 seconds (to avoid port conflicts)
- Frontend: Waits 6 seconds total (3 + 3)

**Requirements:**
- Windows 7 or newer
- Node.js v16+ (from nodejs.org)
- Python 3.8+ (from python.org)
- npm (comes with Node.js)

---

### macOS (start-all.sh)

**How it works:**
- Opens new Terminal tabs for each service
- All services run in same Terminal window
- Switch tabs to view different service outputs
- Close tabs to stop individual services
- Close Terminal to stop entire application

**Requirements:**
- macOS 10.12 (Sierra) or newer
- Node.js v16+ (via Homebrew or nodejs.org)
- Python 3.8+ (via Homebrew or python.org)
- Terminal application (included with macOS)

**Homebrew Installation (Optional):**
```bash
# Install Node.js
brew install node

# Install Python 3
brew install python3

# Verify installations
node --version
npm --version
python3 --version
```

---

### Linux (start-all.sh)

**How it works:**
- Opens new GNOME Terminal tabs for each service
- Requires GNOME Desktop Environment
- For other desktop environments, services will fail to start
- Alternative: Run services manually in separate terminal windows

**Requirements:**
- Linux with GNOME (Ubuntu, Fedora, etc.)
- Node.js v16+ (via apt, yum, or nodejs.org)
- Python 3.8+ (usually pre-installed)
- GNOME Terminal (comes with GNOME Desktop)

**Ubuntu/Debian Installation:**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python (if not already installed)
sudo apt-get install -y python3 python3-pip

# Verify installations
node --version
npm --version
python3 --version
```

**For non-GNOME Linux systems:**
Follow the [Manual Service Startup](#️-manual-service-startup) section below.

---

## 📊 Service Information

### Frontend Service
- **Location**: `./frontend`
- **Technology**: React 19.1.1 + Vite 7.1.2
- **Port**: 5173
- **URL**: http://localhost:5173
- **Features**: Hot Module Replacement (HMR), Live Reload

### Backend Service
- **Location**: `./backend`
- **Technology**: Express.js + Node.js
- **Port**: 5000
- **URL**: http://localhost:5000
- **API Base**: http://localhost:5000/api
- **Dev Tools**: nodemon for auto-reload

### ML Service
- **Location**: `./Pymodel`
- **Technology**: FastAPI + Python 3.8+
- **Port**: 8000
- **URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **API ReDoc**: http://localhost:8000/redoc (ReDoc UI)

---

## 🛠️ Manual Service Startup

If the automated scripts don't work for your system, you can start services manually:

### Terminal 1: Start ML Service
```bash
cd Pymodel
python3 harvest_fastapi.py
# Output should show: "Application startup complete"
```

### Terminal 2: Start Backend Service
```bash
cd backend
npm run dev
# Output should show: "Server running on port 5000"
```

### Terminal 3: Start Frontend Service
```bash
cd frontend
npm run dev
# Output should show: "Local: http://localhost:5173"
```

*Note: Make sure ML service starts first, backend second, frontend third for proper initialization.*

---

## 🔧 Troubleshooting

### Issue: "Node.js is not installed"
**Solution**:
```bash
# Windows
# Download from: https://nodejs.org/

# macOS
brew install node

# Linux (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Issue: "Python is not installed"
**Solution**:
```bash
# Windows
# Download from: https://www.python.org/

# macOS
brew install python3

# Linux (Ubuntu/Debian)
sudo apt-get install -y python3 python3-pip
```

### Issue: "Port already in use"
**Solution** (check what's using ports):
```bash
# Windows
netstat -ano | findstr :5000
netstat -ano | findstr :5173
netstat -ano | findstr :8000

# macOS/Linux
lsof -i :5000
lsof -i :5173
lsof -i :8000

# Kill process (get PID from above)
# Windows: taskkill /PID <PID> /F
# macOS/Linux: kill -9 <PID>
```

### Issue: "npm: command not found"
**Solution**: npm comes with Node.js. Reinstall Node.js:
```bash
# Windows: Download installer from nodejs.org
# macOS: brew install node
# Linux: curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs
```

### Issue: Permission denied (on macOS/Linux)
**Solution**:
```bash
chmod +x start-all.sh
./start-all.sh
```

### Issue: Dependencies installation fails
**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
cd frontend && npm install
cd ../backend && npm install

# For Python
pip3 install -r Pymodel/requirements.txt
```

---

## 📋 Pre-requisites Checklist

Before running scripts, verify:

- [ ] Node.js v16+ installed
- [ ] npm v7+ installed
- [ ] Python 3.8+ installed
- [ ] Internet connection (for npm/pip packages)
- [ ] MongoDB connection configured (backend/.env)
- [ ] Sufficient disk space (~2GB for node_modules)
- [ ] Ports 5000, 5173, 8000 are available

---

## 🚀 Quick Commands

```bash
# Windows: Navigate to root and run
cd C:\path\to\HarvestIQ
.\start-all.bat

# macOS/Linux: Navigate to root and run
cd ~/path/to/HarvestIQ
chmod +x start-all.sh
./start-all.sh

# Start individual services manually
npm run dev --workspace=frontend    # Frontend
npm run dev --workspace=backend     # Backend
python3 Pymodel/harvest_fastapi.py  # ML Service

# Check if ports are available
# Windows: netstat -ano | findstr :5000 :5173 :8000
# macOS/Linux: netstat -tuln | grep -E ":5000|:5173|:8000"
```

---

## 🔍 Service Health Check

### Check if services are running:

```bash
# Frontend (should return HTML)
curl http://localhost:5173

# Backend API (should return JSON)
curl http://localhost:5000/api

# ML Service (should return JSON)
curl http://localhost:8000/docs

# Specific endpoints
curl http://localhost:5000/api/ai-models
curl http://localhost:8000/health
```

---

## 📝 Environment Setup

Both scripts check for environment files. Create them if missing:

**backend/.env**
```env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/harvestiq
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
PYTHON_SERVICE_URL=http://localhost:8000
```

**Pymodel/.env**
```env
API_HOST=0.0.0.0
API_PORT=8000
MODEL_PATH=./models
```

---

## 💡 Tips & Best Practices

1. **Always run from project root** - Both scripts expect to be in the HarvestIQ root directory
2. **Check logs for errors** - Each service shows its output in its terminal
3. **Wait for services to fully start** - ML service usually starts first (3-5 secs)
4. **Don't close windows immediately** - Services need initialization time
5. **Use browser DevTools** - Press F12 in frontend for debugging
6. **Check API docs** - http://localhost:8000/docs for ML API reference

---

## 🎯 First Time Setup

1. **Install dependencies** (scripts do this automatically)
   ```bash
   npm install --workspace=frontend
   npm install --workspace=backend
   pip3 install -r Pymodel/requirements.txt
   ```

2. **Configure environment** (create .env files)
   - `backend/.env` - Database and service config
   - `Pymodel/.env` - ML service config

3. **Seed the database** (one-time setup)
   ```bash
   cd backend
   node seedAiModel.js
   ```

4. **Run startup script**
   ```bash
   # Windows
   .\start-all.bat
   
   # macOS/Linux
   ./start-all.sh
   ```

5. **Access the application**
   - Open http://localhost:5173 in browser
   - Create account and test prediction

---

## 🆘 Getting Help

If scripts don't work:

1. Check [Troubleshooting](#troubleshooting) section above
2. Review individual service logs in their terminal windows
3. Verify all prerequisites are installed
4. Try manual startup (see [Manual Service Startup](#️-manual-service-startup))
5. Open GitHub issue with error details

---

## 📄 License

These startup scripts are part of HarvestIQ and are licensed under MIT License.

---

**Happy farming with HarvestIQ!** 🌾
