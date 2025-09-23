# Getting Started

<cite>
**Referenced Files in This Document**  
- [HarvestIQ/backend/package.json](file://HarvestIQ/backend/package.json)
- [HarvestIQ/package.json](file://HarvestIQ/package.json)
- [HarvestIQ/vite.config.js](file://HarvestIQ/vite.config.js)
- [HarvestIQ/backend/config/database.js](file://HarvestIQ/backend/config/database.js)
- [HarvestIQ/backend/server.js](file://HarvestIQ/backend/server.js)
- [HarvestIQ/backend/middleware/auth.js](file://HarvestIQ/backend/middleware/auth.js)
- [HarvestIQ/backend/models/User.js](file://HarvestIQ/backend/models/User.js)
- [HarvestIQ/backend/routes/auth.js](file://HarvestIQ/backend/routes/auth.js)
- [HarvestIQ/backend/controllers/aiController.js](file://HarvestIQ/backend/controllers/aiController.js)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Cloning the Repository](#cloning-the-repository)
4. [Installing Dependencies](#installing-dependencies)
5. [Environment Configuration](#environment-configuration)
6. [Running the Development Servers](#running-the-development-servers)
7. [Authentication Setup](#authentication-setup)
8. [Troubleshooting Common Issues](#troubleshooting-common-issues)
9. [Quick Demo Workflow](#quick-demo-workflow)
10. [Conclusion](#conclusion)

## Introduction
This guide provides developers with step-by-step instructions to set up and run the HarvestIQ application locally. HarvestIQ is an agricultural intelligence platform that combines a React frontend with a Node.js backend, MongoDB for data storage, and a Python-based AI model for crop yield predictions. This document covers all setup aspects, including dependency installation, environment configuration, authentication setup, and a sample workflow to validate the installation.

## Prerequisites
Before setting up HarvestIQ, ensure the following tools are installed on your system:

- **Node.js** (v18 or higher) – Required for running the frontend and backend servers
- **npm** (v9 or higher) – Package manager for JavaScript dependencies
- **Python** (v3.8 or higher) – Required to execute the AI prediction model
- **MongoDB** – Database for storing user, field, and prediction data
  - Install MongoDB Community Edition or use MongoDB Atlas (cloud)
  - Ensure `mongod` is running or have a valid connection string

Verify installations:
```bash
node --version
npm --version
python --version
```

**Section sources**
- [HarvestIQ/backend/package.json](file://HarvestIQ/backend/package.json)
- [HarvestIQ/package.json](file://HarvestIQ/package.json)

## Cloning the Repository
Clone the HarvestIQ repository from your source control system:

```bash
git clone https://github.com/your-organization/HarvestIQ.git
cd HarvestIQ
```

Ensure the directory structure matches the expected layout, with `HarvestIQ/src` for frontend and `HarvestIQ/backend` for backend code.

## Installing Dependencies
Install dependencies for both frontend and backend using npm.

### Frontend Dependencies
Navigate to the project root and install frontend packages:
```bash
cd HarvestIQ
npm install
```

### Backend Dependencies
Install backend dependencies in the `backend` directory:
```bash
cd HarvestIQ/backend
npm install
```

This installs Express, Mongoose, JWT, and other backend dependencies.

**Section sources**
- [HarvestIQ/package.json](file://HarvestIQ/package.json)
- [HarvestIQ/backend/package.json](file://HarvestIQ/backend/package.json)

## Environment Configuration
Create a `.env` file in both the root and `backend` directories to configure environment variables.

### Root `.env` (Frontend)
Located at `HarvestIQ/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_FRONTEND_URL=http://localhost:5173
```

### Backend `.env` File
Create `HarvestIQ/backend/.env` with the following content:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/harvestiq
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Configuration Explanations
- **MONGODB_URI**: MongoDB connection string. Use `mongodb://localhost:27017/harvestiq` for local or Atlas URL for cloud.
- **JWT_SECRET**: Secret key for signing tokens. Use a strong random string in production.
- **FRONTEND_URL**: Used by CORS middleware to allow frontend requests.
- **RATE_LIMIT_WINDOW_MS** and **RATE_LIMIT_MAX_REQUESTS**: Control API rate limiting.

### Vite Configuration
The `vite.config.js` file configures the Vite development server:
```js
export default defineConfig({
  plugins: [react()],
})
```
No changes are typically needed unless adding new plugins or proxy rules.

### Database Configuration
The `database.js` file handles MongoDB connection:
```js
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};
```
It includes event listeners for connection status and graceful shutdown.

**Section sources**
- [HarvestIQ/backend/config/database.js](file://HarvestIQ/backend/config/database.js)
- [HarvestIQ/vite.config.js](file://HarvestIQ/vite.config.js)

## Running the Development Servers
Start both frontend and backend servers.

### Start Backend Server
From the `HarvestIQ/backend` directory:
```bash
npm run dev
```
This uses `nodemon` to run `server.js` and auto-restart on changes. The server runs on `http://localhost:5000`.

### Start Frontend Server
From the `HarvestIQ` root directory:
```bash
npm run dev
```
This starts the Vite development server on `http://localhost:5173`.

### Health Check
Verify the backend is running:
```bash
curl http://localhost:5000/health
```
Expected response:
```json
{
  "success": true,
  "message": "HarvestIQ Backend API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

**Section sources**
- [HarvestIQ/backend/server.js](file://HarvestIQ/backend/server.js)

## Authentication Setup
Authentication is handled via JWT in the backend.

### Key Files
- **auth.js (middleware)**: Contains `protect`, `generateToken`, and `verifyToken` functions.
- **auth.js (routes)**: Implements `/api/auth/register`, `/login`, and profile routes.
- **User.js (model)**: Defines user schema with password hashing via `bcryptjs`.

### Registration and Login Flow
1. **Register**: POST to `/api/auth/register` with `fullName`, `email`, `password`.
2. **Login**: POST to `/api/auth/login` to receive a JWT.
3. **Protected Routes**: Include `Authorization: Bearer <token>` in headers.

### OAuth Providers
Currently, the system uses local email/password authentication. OAuth integration (Google, Facebook) is not implemented but can be added to the `auth.js` routes.

**Section sources**
- [HarvestIQ/backend/middleware/auth.js](file://HarvestIQ/backend/middleware/auth.js)
- [HarvestIQ/backend/routes/auth.js](file://HarvestIQ/backend/routes/auth.js)
- [HarvestIQ/backend/models/User.js](file://HarvestIQ/backend/models/User.js)

## Troubleshooting Common Issues
### Database Connection Failures
- Ensure MongoDB is running: `net start MongoDB` (Windows) or `brew services start mongodb-community` (macOS).
- Verify `MONGODB_URI` in `.env` matches your MongoDB instance.
- Check firewall settings if using a remote MongoDB.

### CORS Errors
- Confirm `FRONTEND_URL` in `.env` matches the Vite server URL.
- Ensure `corsOptions` in `server.js` includes the correct origin.

### Python Model Integration Issues
- Ensure Python is in system PATH: `python --version`.
- Verify the script path in `aiController.js`: `../../Py model/harvest.py`.
- Check file permissions and JSON parsing in the Python script output.

### Dependency Installation Failures
- Delete `node_modules` and `package-lock.json`, then re-run `npm install`.
- Use consistent Node.js version across team members.

**Section sources**
- [HarvestIQ/backend/server.js](file://HarvestIQ/backend/server.js)
- [HarvestIQ/backend/controllers/aiController.js](file://HarvestIQ/backend/controllers/aiController.js)

## Quick Demo Workflow
1. **Register a User**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"fullName":"John Doe","email":"john@example.com","password":"Password123"}'
   ```

2. **Log In**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"john@example.com","password":"Password123"}'
   ```
   Copy the returned JWT token.

3. **Create a Field** (replace `YOUR_TOKEN`):
   ```bash
   curl -X POST http://localhost:5000/api/fields \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"name":"Main Field","area":5,"crop":"wheat"}'
   ```

4. **Generate a Prediction**:
   ```bash
   curl -X POST http://localhost:5000/api/ai/predict \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"crop":"wheat","state":"Punjab","area":5,"soilType":"clay","irrigation":"drip"}'
   ```

Expected response includes AI-generated yield prediction.

## Conclusion
You now have a fully functional local instance of HarvestIQ. The application is structured with a modular backend using Express and Mongoose, a React frontend with Vite, and integrated Python AI capabilities. Follow the demo workflow to verify your setup, and refer to the troubleshooting section if issues arise. For production deployment, ensure environment variables are secured and MongoDB is properly configured for scalability.