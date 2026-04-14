# 🌾 HarvestIQ - Agricultural Intelligence Platform

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-HarvestIQ-blue?style=flat-square&logo=github)](https://github.com/yourusername/HarvestIQ)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![React](https://img.shields.io/badge/React-19.1.1-blue?style=flat-square&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=flat-square&logo=node.js)](https://expressjs.com)
[![Python](https://img.shields.io/badge/Python-FastAPI-blue?style=flat-square&logo=python)](https://fastapi.tiangolo.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)](https://www.mongodb.com)

**Empowering farmers with AI-driven crop yield predictions and personalized agricultural insights**

[Features](#-key-features) • [Tech Stack](#-technology-stack) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 🎯 About HarvestIQ

HarvestIQ is a modern, full-stack **Agricultural Intelligence Platform** that leverages AI and machine learning to help farmers make data-driven decisions about crop cultivation. By integrating real-time weather data, soil information, and market prices, HarvestIQ provides accurate **yield predictions** and **personalized recommendations** for optimal farming outcomes.

### Why HarvestIQ?
- 🤖 **AI-Powered**: Advanced machine learning models trained on agricultural data
- 🌍 **Multilingual**: Support for 11 languages to reach farmers globally
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
- **React** 19.1.1 with **Vite** 7.1.2 for fast development
- **Tailwind CSS** 3.4.17 for modern styling
- **React Router** 7.9.1 for navigation
- **i18next** 25.5.2 for multilingual support
- **Axios** for API communication

### Backend
- **Express.js** with ES6 modules
- **MongoDB Atlas** with Mongoose ODM
- **JWT** authentication with bcrypt
- **Helmet**, CORS, Rate Limiting for security

### AI & ML
- **FastAPI** for high-performance ML server
- **Scikit-learn** & **XGBoost** for predictions
- **Pandas** & **NumPy** for data processing

---

## 📁 Project Structure

```
HarvestIQ/
├── frontend/              # React Application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API & business logic
│   │   ├── hooks/        # Custom React hooks
│   │   ├── context/      # Global state management
│   │   ├── locales/      # 11-language translations
│   │   └── utils/        # Utilities
│   └── package.json
│
├── backend/               # Express.js API
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoints
│   ├── middleware/       # Auth & validation
│   ├── services/         # Business logic
│   └── package.json
│
├── Pymodel/              # Python ML Service
│   ├── harvest_fastapi.py
│   ├── harvest.py
│   ├── requirements.txt
│   └── crop_yield.csv
│
├── Markdowns/            # Documentation
│   ├── README.md (detailed)
│   ├── architecture.md
│   ├── SETUP_GUIDE.md
│   └── more docs
│
└── package.json          # Monorepo configuration
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v16+ with npm
- **Python** 3.8+ with pip
- **MongoDB Atlas** account or local MongoDB
- **Git**

### Installation & Setup

1. **Clone and navigate**
```bash
git clone https://github.com/yourusername/HarvestIQ.git
cd HarvestIQ
```

2. **Install all dependencies**
```bash
npm install --workspace=frontend
npm install --workspace=backend
cd Pymodel && pip install -r requirements.txt && cd ..
```

3. **Configure environment variables**

**`backend/.env`**
```env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/harvestiq
JWT_SECRET=your_jwt_secret_key
PORT=5000
PYTHON_SERVICE_URL=http://localhost:8000
```

**`Pymodel/.env`**
```env
API_HOST=0.0.0.0
API_PORT=8000
```

4. **Start all services**

**Option A: Windows (One-click startup)**
```bash
.\start-all.bat
```

**Option B: Individual terminals**
```bash
# Terminal 1: Frontend (React)
npm run dev --workspace=frontend

# Terminal 2: Backend (Node.js)
npm run dev --workspace=backend

# Terminal 3: Python ML Service
cd Pymodel && python harvest_fastapi.py
```

5. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- ML Service: http://localhost:8000

---

## 📚 API Endpoints

### Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | User login |
| POST | `/predictions` | Create prediction |
| GET | `/predictions` | Get prediction history |
| POST | `/fields` | Register field |
| GET | `/fields` | Get user fields |
| GET | `/ai-models` | Get available models |

See [full documentation](./Markdowns/README.md) for detailed API specs.

---

## 🌍 Supported Languages

| Language | Code |
|----------|------|
| English | en |
| Hindi | hi |
| Tamil | ta |
| Telugu | te |
| Odia | or |
| Punjabi | pa |
| Bengali | bn |
| Spanish | es |
| German | de |
| French | fr |
| Arabic | ar |

---

## 🔐 Security

- ✅ JWT-based authentication
- ✅ bcrypt password hashing
- ✅ Rate limiting on APIs
- ✅ Input validation & sanitization
- ✅ CORS protection
- ✅ Environment variables for secrets
- ✅ Helmet security headers

---

## 📊 Architecture Overview

```
Frontend (React)
     ↓ HTTP/REST
Backend (Express)
     ↓
MongoDB Atlas
ML Service (FastAPI)
     ↓
ML Models
```

---

## 🚧 Roadmap

**Phase 1** ✅
- [x] Multi-language support
- [x] JWT authentication
- [x] Crop predictions
- [x] Real-time dashboard

**Phase 2** 🔄
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] WebSocket updates

**Phase 3** 📋
- [ ] IoT sensors
- [ ] Computer vision for diseases
- [ ] Market predictions

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit changes (`git commit -m 'Add YourFeature'`)
4. Push to branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## 👥 Authors

**Team Lead**: [Balaji K](https://github.com/#)
**ML MODEL**: [Devanandh](https://github.com/#)
**Backend & Support**: [Parvadha Varsan](https://github.com/#)
**Backend & Security**: [Sathya Jothi K](https://github.com/#)
**Frontend UI/UX**: [Jeeva Priya R](https://github.com/Jeevapriya1417)
**Integration & Support**: [Balaji K](https://github.com/#)

---

## 📞 Support

- 📧 Email: santhoshkumar141709@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/HarvestIQ/issues)
- 📖 Docs: [Full Documentation](./Markdowns/)

---

## 🙏 Acknowledgments

- Built with ❤️ for farmers and agricultural communities
- Government agencies for open data APIs
- Open-source community for amazing tools
- Agent driven implementation
---

<div align="center">

### Give us a ⭐ if this project helps you!

[Back to top](#-harvestiq---agricultural-intelligence-platform)

</div>
