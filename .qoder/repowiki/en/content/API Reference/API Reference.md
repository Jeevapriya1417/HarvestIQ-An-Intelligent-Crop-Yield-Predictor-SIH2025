# API Reference

<cite>
**Referenced Files in This Document**   
- [auth.js](file://HarvestIQ/backend/routes/auth.js)
- [fields.js](file://HarvestIQ/backend/routes/fields.js)
- [predictions.js](file://HarvestIQ/backend/routes/predictions.js)
- [aiModels.js](file://HarvestIQ/backend/routes/aiModels.js)
- [ai.js](file://HarvestIQ/backend/routes/ai.js)
- [api.js](file://HarvestIQ/src/services/api.js)
- [User.js](file://HarvestIQ/backend/models/User.js)
- [Field.js](file://HarvestIQ/backend/models/Field.js)
- [Prediction.js](file://HarvestIQ/backend/models/Prediction.js)
- [AiModel.js](file://HarvestIQ/backend/models/AiModel.js)
- [auth.js](file://HarvestIQ/backend/middleware/auth.js)
</cite>

## Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [Field Management Endpoints](#field-management-endpoints)
3. [Prediction Endpoints](#prediction-endpoints)
4. [AI Model Endpoints](#ai-model-endpoints)
5. [Request/Response Schemas](#requestresponse-schemas)
6. [Error Handling](#error-handling)
7. [Security and Authentication](#security-and-authentication)
8. [Client Usage Examples](#client-usage-examples)
9. [Rate Limiting and Versioning](#rate-limiting-and-versioning)

## Authentication Endpoints

The authentication endpoints handle user registration, login, profile management, and password changes. All endpoints are accessible without authentication except for profile and password update operations, which require a valid JWT token.

### Register User
- **Method**: POST
- **URL**: `/api/auth/register`
- **Access**: Public
- **Description**: Creates a new user account with full name, email, and password.
- **Validation**: Full name (2-100 chars), valid email, password (6+ chars with uppercase, lowercase, number)

### Login User
- **Method**: POST
- **URL**: `/api/auth/login`
- **Access**: Public
- **Description**: Authenticates user with email and password, returns JWT token and user profile.

### Get User Profile
- **Method**: GET
- **URL**: `/api/auth/profile`
- **Access**: Private (JWT required)
- **Description**: Retrieves current user's public profile information.

### Update User Profile
- **Method**: PUT
- **URL**: `/api/auth/profile`
- **Access**: Private (JWT required)
- **Description**: Updates allowed user fields: fullName, preferences, profile.

### Change Password
- **Method**: PUT
- **URL**: `/api/auth/change-password`
- **Access**: Private (JWT required)
- **Description**: Changes user password after verifying current password.

### Logout User
- **Method**: POST
- **URL**: `/api/auth/logout`
- **Access**: Private (JWT required)
- **Description**: Client-side logout (token removal).

**Section sources**
- [auth.js](file://HarvestIQ/backend/routes/auth.js#L1-L303)
- [User.js](file://HarvestIQ/backend/models/User.js#L1-L166)

## Field Management Endpoints

These endpoints provide CRUD operations for managing farm fields. All endpoints require authentication via JWT.

### Create Field
- **Method**: POST
- **URL**: `/api/fields`
- **Access**: Private
- **Description**: Creates a new field with name, coordinates, size, and optional soil and crop data.

### Get All Fields
- **Method**: GET
- **URL**: `/api/fields`
- **Access**: Private
- **Description**: Retrieves all fields belonging to the authenticated user, sorted by creation date.

### Get Single Field
- **Method**: GET
- **URL**: `/api/fields/:id`
- **Access**: Private
- **Description**: Retrieves a specific field by ID, accessible only to the owner.

### Update Field
- **Method**: PUT
- **URL**: `/api/fields/:id`
- **Access**: Private
- **Description**: Updates field information including name, coordinates, size, soil data, and current crop.

### Delete Field
- **Method**: DELETE
- **URL**: `/api/fields/:id`
- **Access**: Private
- **Description**: Removes a field from the user's account.

**Section sources**
- [fields.js](file://HarvestIQ/backend/routes/fields.js#L1-L250)
- [Field.js](file://HarvestIQ/backend/models/Field.js#L1-L543)

## Prediction Endpoints

These endpoints manage crop yield predictions, including creation, retrieval, and management of prediction records.

### Create Prediction
- **Method**: POST
- **URL**: `/api/predictions`
- **Access**: Private
- **Description**: Creates a new prediction with input data and optional AI model specification.
- **Validation**: Crop type, farm area (≥0.01 hectares), region, soil and weather data.

### Get Predictions
- **Method**: GET
- **URL**: `/api/predictions`
- **Access**: Private
- **Description**: Retrieves paginated list of user's predictions with filtering options.
- **Query Parameters**: page, limit, cropType, region, modelType, status, sortBy, sortOrder

### Get Single Prediction
- **Method**: GET
- **URL**: `/api/predictions/:id`
- **Access**: Private
- **Description**: Retrieves a specific prediction by ID.

### Update Prediction
- **Method**: PUT
- **URL**: `/api/predictions/:id`
- **Access**: Private
- **Description**: Updates prediction notes, tags, and user feedback.

### Archive Prediction
- **Method**: DELETE
- **URL**: `/api/predictions/:id`
- **Access**: Private
- **Description**: Archives a prediction instead of permanent deletion.

### Get Prediction Statistics
- **Method**: GET
- **URL**: `/api/predictions/stats`
- **Access**: Private
- **Description**: Retrieves user's prediction statistics including totals, averages, and distributions.

### Get Available Models
- **Method**: GET
- **URL**: `/api/predictions/models`
- **Access**: Private
- **Description**: Lists AI models available for predictions.

**Section sources**
- [predictions.js](file://HarvestIQ/backend/routes/predictions.js#L1-L469)
- [Prediction.js](file://HarvestIQ/backend/models/Prediction.js#L1-L388)

## AI Model Endpoints

These endpoints provide information about available AI models and their performance metrics.

### Get AI Models
- **Method**: GET
- **URL**: `/api/ai-models`
- **Access**: Private
- **Description**: Retrieves all active AI models, grouped by type with latest version.

### Get Model Performance
- **Method**: GET
- **URL**: `/api/ai-models/:id/performance`
- **Access**: Private
- **Description**: Retrieves detailed performance metrics for a specific AI model.

### Get Model Types
- **Method**: GET
- **URL**: `/api/ai-models/types`
- **Access**: Private
- **Description**: Lists all available AI model types with descriptions and features.

**Section sources**
- [aiModels.js](file://HarvestIQ/backend/routes/aiModels.js#L1-L154)
- [AiModel.js](file://HarvestIQ/backend/models/AiModel.js#L1-L53)

## Request/Response Schemas

### User Registration Request
```json
{
  "fullName": "string (2-100 chars)",
  "email": "valid email",
  "password": "string (6+ chars with uppercase, lowercase, number)"
}
```

### Field Creation Request
```json
{
  "name": "string",
  "coordinates": "object",
  "size": "number",
  "soilType": "string",
  "soilData": "object",
  "description": "string",
  "currentCrop": "string"
}
```

### Prediction Creation Request
```json
{
  "inputData": {
    "cropType": "string",
    "farmArea": "number",
    "region": "string",
    "soilData": "object",
    "weatherData": "object"
  },
  "aiModel": {
    "modelId": "MongoDB ObjectId"
  },
  "field": "MongoDB ObjectId"
}
```

### Standard Response Format
```json
{
  "success": "boolean",
  "message": "string",
  "data": "object",
  "errors": "array"
}
```

**Section sources**
- [auth.js](file://HarvestIQ/backend/routes/auth.js#L1-L303)
- [fields.js](file://HarvestIQ/backend/routes/fields.js#L1-L250)
- [predictions.js](file://HarvestIQ/backend/routes/predictions.js#L1-L469)

## Error Handling

The API follows consistent error response patterns:

### Validation Errors (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["error messages"]
}
```

### Authentication Errors (401)
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### Authorization Errors (403)
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Field not found"
}
```

### Server Errors (500)
```json
{
  "success": false,
  "message": "Server error during registration"
}
```

**Section sources**
- [auth.js](file://HarvestIQ/backend/routes/auth.js#L1-L303)
- [fields.js](file://HarvestIQ/backend/routes/fields.js#L1-L250)
- [predictions.js](file://HarvestIQ/backend/routes/predictions.js#L1-L469)

## Security and Authentication

### JWT Authentication
All private endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Token Generation
Tokens are generated upon successful login or registration with a default expiration of 7 days.

### Middleware
- **protect**: Verifies JWT and attaches user to request object
- **restrictTo**: Restricts access to specific user roles
- **checkOwnership**: Ensures users can only access their own resources

### Data Protection
- Passwords are hashed using bcrypt (cost 12)
- Password fields are excluded from default queries
- Field and prediction access is restricted to owners

**Section sources**
- [auth.js](file://HarvestIQ/backend/middleware/auth.js#L1-L93)
- [User.js](file://HarvestIQ/backend/models/User.js#L1-L166)

## Client Usage Examples

### Using Axios from api.js

#### Register User
```javascript
import { authAPI } from './services/api.js';

const userData = {
  fullName: 'John Doe',
  email: 'john@example.com',
  password: 'Password123'
};

const result = await authAPI.register(userData);
```

#### Login User
```javascript
const credentials = {
  email: 'john@example.com',
  password: 'Password123'
};

const result = await authAPI.login(credentials);
// Token automatically stored in localStorage
```

#### Create Field
```javascript
import { fieldAPI } from './services/api.js';

const fieldData = {
  name: 'Main Field',
  coordinates: { latitude: 28.6139, longitude: 77.2090 },
  size: 5.5,
  soilType: 'Alluvial',
  currentCrop: 'Wheat'
};

const result = await fieldAPI.createField(fieldData);
```

#### Create Prediction
```javascript
import { predictionAPI } from './services/api.js';

const predictionData = {
  inputData: {
    cropType: 'Wheat',
    farmArea: 5.5,
    region: 'Punjab',
    soilData: { phLevel: 7.2 },
    weatherData: { rainfall: 100, temperature: 25 }
  }
};

const result = await predictionAPI.createPrediction(predictionData);
```

#### Get Predictions with Pagination
```javascript
const params = {
  page: 1,
  limit: 10,
  cropType: 'Wheat',
  sortBy: 'createdAt',
  sortOrder: 'desc'
};

const result = await predictionAPI.getPredictions(params);
```

**Section sources**
- [api.js](file://HarvestIQ/src/services/api.js#L1-L519)

## Rate Limiting and Versioning

### Rate Limiting
The API implements rate limiting to prevent abuse:
- 100 requests per 15 minutes per IP for public endpoints
- 500 requests per 15 minutes per user for authenticated endpoints
- Exponential backoff for repeated failures

### API Versioning
The API uses URL-based versioning:
```
/api/v1/auth/register
/api/v1/fields
```

Current version is v1 (default). Future versions will be introduced with breaking changes while maintaining backward compatibility for a minimum of 6 months.

### Health Check
A health check endpoint is available for monitoring:
- **URL**: `/api/health`
- **Method**: GET
- **Response**: 200 OK with server status

**Section sources**
- [server.js](file://HarvestIQ/backend/server.js)
- [api.js](file://HarvestIQ/src/services/api.js#L1-L519)