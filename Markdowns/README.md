# 🌾 HarvestIQ - Agricultural Intelligence Platform

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-HarvestIQ-blue?style=flat-square&logo=github)](https://github.com/yourusername/HarvestIQ)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![React](https://img.shields.io/badge/React-19.1.1-blue?style=flat-square&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=flat-square&logo=node.js)](https://expressjs.com)
[![Python](https://img.shields.io/badge/Python-FastAPI-blue?style=flat-square&logo=python)](https://fastapi.tiangolo.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)](https://www.mongodb.com)

**Empowering farmers with AI-driven crop yield predictions and personalized agricultural insights**

[Live Demo](#) • [Documentation](./Markdowns/) • [Report Bug](#) • [Request Feature](#)

</div>

---

## 🎯 About HarvestIQ

HarvestIQ is a modern, full-stack **Agricultural Intelligence Platform** that leverages AI and machine learning to help farmers make data-driven decisions about crop cultivation. By integrating real-time weather data, soil information, and market prices, HarvestIQ provides accurate **yield predictions** and **personalized recommendations** for optimal farming outcomes.

### Why HarvestIQ?
- 🤖 **AI-Powered**: Advanced machine learning models trained on agricultural data
- 🌍 **Multilingual**: Support for 10+ languages to reach farmers globally
- 📊 **Real-time Analytics**: Live dashboards with weather updates and market trends
- 🔒 **Secure**: JWT authentication with encrypted sensitive data
- 📱 **User-Friendly**: Intuitive interface designed for farmers of all tech backgrounds
- 🚀 **Scalable**: Cloud-ready architecture with MongoDB Atlas

---

## ✨ Key Features

### 🎨 Frontend
- **Multi-language Support**: English, Hindi, Tamil, Telugu, Odia, Punjabi, Bengali, Spanish, German, French, Arabic
- **Real-time Dashboard**: Live weather updates, user statistics, and activity feeds
- **Prediction Form**: Intuitive multi-step form for crop yield predictions
- **Field Management**: GPS-integrated field tracking with soil data
- **Analytics Dashboard**: Visual insights into prediction performance
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Mode**: Theme switcher for user preference

### 🔧 Backend API
- **RESTful Architecture**: Clean, well-organized API endpoints
- **Authentication**: JWT-based secure authentication system
- **Database Management**: MongoDB with optimized queries and indexing
- **Rate Limiting**: Protection against abuse with configurable limits
- **Data Validation**: Comprehensive input validation and sanitization
- **Error Handling**: Graceful error responses with meaningful messages

### 🧠 AI & ML Services
- **Crop-Specific Models**: Separate prediction models for different crops
- **FastAPI Integration**: High-performance Python backend for ML operations
- **Real-time Predictions**: Sub-second response times for predictions
- **Model Versioning**: Track and manage different model versions
- **External Data Integration**: Government weather APIs, soil health cards, market data

---

## 🏗️ Technology Stack

### Frontend
```
Framework:              React 19.1.1 with Vite 7.1.2
Routing:                React Router DOM 7.9.1
Styling:                Tailwind CSS 3.4.17
State Management:       React Context API
Internationalization:   i18next 25.5.2
Icons:                  Lucide React 0.544.0
HTTP Client:            Axios 1.12.2
```

### Backend
```
Framework:              Express.js (ES6 Modules)
Database:               MongoDB Atlas with Mongoose ODM
Authentication:         JWT + bcrypt
Security:               Helmet, CORS, Rate Limiting
Validation:             express-validator, Joi
Runtime:                Node.js (recommended v16+)
Dev Tools:              Nodemon for auto-reload
```

### AI & ML
```
Framework:              FastAPI
Server:                 Uvicorn
ML Libraries:           Scikit-learn, XGBoost
Data Processing:        Pandas, NumPy
Serialization:          Joblib
```

### DevOps & Infrastructure
```
Package Manager:        npm (Workspaces)
Version Control:        Git
Database:               MongoDB Atlas Cloud
Containerization:       Docker-ready architecture
```

---

## 📁 Project Structure

```
HarvestIQ/
│
├── frontend/                      # React Application (Port 5173)
│   ├── src/
│   │   ├── components/           # React UI components
│   │   │   ├── Dashboard.jsx     # Main dashboard
│   │   │   ├── PredictionForm.jsx# Prediction form
│   │   │   ├── Fields.jsx        # Field management
│   │   │   ├── Analytics.jsx     # Analytics dashboard
│   │   │   ├── Reports.jsx       # Prediction history
│   │   │   ├── Settings.jsx      # User settings
│   │   │   ├── Auth.jsx          # Authentication
│   │   │   ├── Navbar.jsx        # Navigation
│   │   │   ├── ErrorBoundary.jsx # Error handling
│   │   │   └── ui/               # Reusable UI components
│   │   ├── services/             # API & business logic
│   │   ├── hooks/                # Custom React hooks
│   │   ├── context/              # Global state
│   │   ├── locales/              # i18n translations
│   │   └── utils/                # Utilities
│   ├── vite.config.js            # Vite configuration
│   ├── tailwind.config.js         # Tailwind configuration
│   └── package.json              # Frontend dependencies
│
├── backend/                       # Express API (Port 5000)
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Prediction.js        # Prediction schema
│   │   ├── Field.js             # Field schema
│   │   └── AiModel.js           # AI Model schema
│   ├── routes/
│   │   ├── auth.js              # Auth routes
│   │   ├── predictions.js       # Prediction routes
│   │   ├── fields.js            # Field routes
│   │   ├── ai.js                # AI routes
│   │   └── aiModels.js          # AI model routes
│   ├── middleware/
│   │   └── auth.js              # JWT authentication
│   ├── services/
│   │   ├── aiService.js         # AI integration
│   │   ├── dataTransformer.js   # Data transformation
│   │   └── governmentDataService.js # External APIs
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── server.js                # Main server file
│   ├── .env                     # Environment variables
│   └── package.json             # Backend dependencies
│
├── Pymodel/                       # Python ML Service (Port 8000)
│   ├── harvest_fastapi.py       # FastAPI ML server
│   ├── harvest_api.py           # API wrapper
│   ├── harvest_cli.py           # CLI interface
│   ├── harvest.py               # Core ML models
│   ├── crop_yield.csv           # Training data
│   ├── requirements.txt         # Python dependencies
│   └── .env                     # ML service config
│
├── Markdowns/                     # Documentation
│   ├── README.md                # This file
│   ├── architecture.md          # Detailed architecture
│   ├── SETUP_GUIDE.md           # Setup instructions
│   ├── RESTRUCTURE_COMPLETE.md  # Restructuring notes
│   ├── CLEANUP_REPORT.md        # Cleanup summary
│   ├── changelog.md             # Version history
│   └── future.md                # Roadmap
│
├── package.json                  # Monorepo root configuration
├── start-all.bat                # One-click startup script
└── .gitignore                   # Git ignore rules

```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v16+ with npm
- **Python** 3.8+ with pip
- **MongoDB Atlas** account (or local MongoDB)
- **Git**

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/HarvestIQ.git
cd HarvestIQ
```

2. **Install Frontend Dependencies**
```bash
npm install --workspace=frontend
```

3. **Install Backend Dependencies**
```bash
npm install --workspace=backend
```

4. **Install Python Dependencies**
```bash
cd Pymodel
pip install -r requirements.txt
cd ..
```

### Configuration

1. **Backend Environment Setup** (`backend/.env`)
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/harvestiq
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
NODE_ENV=development
PYTHON_SERVICE_URL=http://localhost:8000
```

2. **Python Service Environment** (`Pymodel/.env`)
```env
API_HOST=0.0.0.0
API_PORT=8000
MODEL_PATH=./models
```

### Running the Application

#### Option 1: Start All Services at Once (Windows)
```bash
.\start-all.bat
```

#### Option 2: Start Services Individually

**Terminal 1 - Frontend (React)**
```bash
npm run dev --workspace=frontend
# Runs on http://localhost:5173
```

**Terminal 2 - Backend (Node.js API)**
```bash
npm run dev --workspace=backend
# Runs on http://localhost:5000
```

**Terminal 3 - ML Service (FastAPI)**
```bash
cd Pymodel
python harvest_fastapi.py
# Runs on http://localhost:8000
```

### First Time Setup

1. **Seed AI Models** (Run once)
```bash
cd backend
node seedAiModel.js
cd ..
```

2. **Access the Application**
- Open http://localhost:5173 in your browser
- Create a new account
- Fill in your profile and farm details
- Submit a prediction request

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```bash
POST /auth/register
Content-Type: application/json

{
  "name": "John Farmer",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+91-9876543210",
  "state": "Maharashtra"
}
```

#### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "name": "John Farmer", ... }
}
```

### Prediction Endpoints

#### Create Prediction
```bash
POST /predictions
Authorization: Bearer {token}
Content-Type: application/json

{
  "cropType": "maize",
  "fieldId": "field_123",
  "soilData": { "pH": 6.5, "nitrogen": 45, ... },
  "weatherData": { "temperature": 28, "humidity": 75, ... }
}
```

#### Get Prediction History
```bash
GET /predictions
Authorization: Bearer {token}

Response: Array of predictions with results and recommendations
```

### Field Management Endpoints

#### Register Field
```bash
POST /fields
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "North Field",
  "area": 2.5,
  "latitude": 19.0760,
  "longitude": 72.8777,
  "soilType": "loamy"
}
```

For complete API documentation, see [API_DOCS.md](./Markdowns/)

---

## 🌍 Supported Languages

HarvestIQ is available in 11 languages:

| Language | Code | Region |
|----------|------|--------|
| English | en | Global |
| Hindi | hi | India |
| Tamil | ta | South India |
| Telugu | te | South India |
| Odia | or | East India |
| Punjabi | pa | North India |
| Bengali | bn | East India |
| Spanish | es | Latin America |
| German | de | Europe |
| French | fr | Africa/Europe |
| Arabic | ar | Middle East |

Switch languages in the app using the language selector in the navbar.

---

## 📊 Architecture & Design

### Microservices Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                   │
│            http://localhost:5173                     │
└────────────────────┬────────────────────────────────┘
                     │ HTTP/REST
┌────────────────────▼────────────────────────────────┐
│                 Express.js Backend                   │
│              http://localhost:5000                   │
│   ┌──────────────────────────────────────────┐      │
│   │        Authentication (JWT)              │      │
│   ├──────────────────────────────────────────┤      │
│   │  Routes: Auth, Predictions, Fields, AI   │      │
│   └──────────────────────────────────────────┘      │
└────────┬─────────────────────────┬──────────────────┘
         │                         │
    ┌────▼──────┐        ┌────────▼──────┐
    │  MongoDB   │        │ FastAPI ML    │
    │  Atlas     │        │ Service       │
    └───────────┘        └────────┬───────┘
                                  │
                         ┌────────▼────────┐
                         │  ML Models      │
                         │  (Scikit-learn) │
                         └─────────────────┘
```

### Data Flow

1. **User Registration/Login** → JWT Token
2. **Field Management** → MongoDB Storage
3. **Prediction Request** → Backend Processing
4. **ML Processing** → FastAPI Service
5. **Results** → Frontend Display & Storage

---

## 🧪 Testing

```bash
# Run linting
npm run lint --workspace=frontend

# Build for production
npm run build --workspace=frontend

# Test backend integration
cd backend && node checkIntegration.js
```

---

## 🔐 Security Features

- ✅ **JWT Authentication**: Secure token-based authentication
- ✅ **Password Encryption**: bcrypt hashing with salt rounds
- ✅ **Rate Limiting**: Protect APIs from brute force attacks
- ✅ **CORS Protection**: Configured allowed origins
- ✅ **Helmet Security**: HTTP security headers
- ✅ **Input Validation**: Comprehensive validation and sanitization
- ✅ **Environment Variables**: Sensitive data in .env files (never committed)
- ✅ **HTTPS Ready**: Production-grade SSL/TLS support

---

## 📈 Performance Optimizations

- **Frontend**: Vite for fast HMR, code splitting, lazy loading
- **Backend**: Connection pooling, query optimization, caching
- **ML Service**: Model optimization, batch processing
- **Database**: Indexed queries, proper schema design
- **Real-time**: WebSocket-ready architecture (future enhancement)

---

## 🚧 Roadmap

### Phase 1 ✅ (Current)
- [x] Multi-language support (10+ languages)
- [x] JWT authentication
- [x] Crop predictions
- [x] Real-time dashboard
- [x] Field management

### Phase 2 🔄 (In Progress)
- [ ] Advanced analytics and reporting
- [ ] Historical trend analysis
- [ ] Community features
- [ ] Mobile app (React Native)
- [ ] WebSocket real-time updates

### Phase 3 📋 (Planned)
- [ ] IoT sensor integration
- [ ] Disease detection using computer vision
- [ ] Automated irrigation recommendations
- [ ] Market price predictions
- [ ] Insurance integration

For detailed roadmap, see [future.md](./Markdowns/future.md)

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Guidelines
- Follow code style in existing files
- Add comments for complex logic
- Test your changes before submitting
- Update documentation if needed
- Keep commits atomic and meaningful

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

---

## 👥 Authors & Contributors

**Lead Developer**: [Santhosh Kumar S](https://github.com/yourusername)

**Contributors**: [Add your name here by contributing!]

---

## 📞 Support & Contact

- 📧 **Email**: support@harvestiq.com
- 💬 **Discord**: [Join our community](#)
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/HarvestIQ/issues)
- 📖 **Documentation**: [Full Documentation](./Markdowns/)

---

## 🙏 Acknowledgments

- Built with ❤️ for farmers and agricultural communities
- Special thanks to government agencies for open data APIs
- Thanks to the open-source community for amazing tools

---

## 📊 Project Statistics

- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: Express.js + MongoDB + JWT
- **ML**: FastAPI + Scikit-learn + XGBoost
- **Languages**: 11 supported languages
- **Components**: 48+ React components
- **API Endpoints**: 25+ RESTful endpoints
- **Lines of Code**: 15,000+

---

<div align="center">

### ⭐ If this project helped you, please consider giving it a star!

[⬆ Back to top](#harvestiq---agricultural-intelligence-platform)

</div>
