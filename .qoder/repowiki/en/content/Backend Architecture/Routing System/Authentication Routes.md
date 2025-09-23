# Authentication Routes

<cite>
**Referenced Files in This Document**   
- [auth.js](file://HarvestIQ/backend/routes/auth.js)
- [auth.js](file://HarvestIQ/backend/middleware/auth.js)
- [User.js](file://HarvestIQ/backend/models/User.js)
- [validation.js](file://HarvestIQ/backend/utils/validation.js)
- [api.js](file://HarvestIQ/src/services/api.js)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Authentication Endpoints Overview](#authentication-endpoints-overview)
3. [User Registration](#user-registration)
4. [User Login](#user-login)
5. [Profile Management](#profile-management)
6. [Password Management](#password-management)
7. [Authentication Flow](#authentication-flow)
8. [Security Considerations](#security-considerations)
9. [Integration with Frontend](#integration-with-frontend)
10. [Error Handling](#error-handling)

## Introduction

The authentication routing module in HarvestIQ's backend provides a comprehensive system for user identity management, secure access control, and profile management. This document details the implementation of authentication endpoints, their integration with middleware components, and the overall security architecture. The system is designed to ensure secure user registration, authentication, and profile management while maintaining data integrity and protecting sensitive information.

The authentication system follows RESTful principles and implements industry-standard security practices including JWT-based authentication, password hashing with BcryptJS, and comprehensive input validation. The routes are organized in a modular fashion, separating public endpoints for registration and login from protected endpoints that require authentication.

**Section sources**
- [auth.js](file://HarvestIQ/backend/routes/auth.js#L1-L302)
- [middleware/auth.js](file://HarvestIQ/backend/middleware/auth.js#L1-L92)

## Authentication Endpoints Overview

The authentication module exposes six primary endpoints that handle different aspects of user authentication and profile management. These endpoints are categorized by access level, with public endpoints available to unauthenticated users and private endpoints protected by JWT authentication.

```mermaid
flowchart TD
A["POST /api/auth/register"] --> |Public| B["User Registration"]
C["POST /api/auth/login"] --> |Public| D["User Login"]
E["GET /api/auth/profile"] --> |Private| F["Get Profile"]
G["PUT /api/auth/profile"] --> |Private| H["Update Profile"]
I["PUT /api/auth/change-password"] --> |Private| J["Change Password"]
K["POST /api/auth/logout"] --> |Private| L["Logout"]
B --> M["Creates new user account"]
D --> N["Authenticates user & issues JWT"]
F --> O["Retrieves user profile"]
H --> P["Updates user information"]
J --> Q["Changes user password"]
L --> R["Client-side token removal"]
```

**Diagram sources**
- [auth.js](file://HarvestIQ/backend/routes/auth.js#L1-L302)

**Section sources**
- [auth.js](file://HarvestIQ/backend/routes/auth.js#L1-L302)

## User Registration

The user registration endpoint allows new users to create an account in the HarvestIQ system. This endpoint implements comprehensive validation to ensure data quality and security.

### Endpoint Details
- **Method**: POST
- **Path**: `/api/auth/register`
- **Access**: Public
- **Success Status**: 201 Created

### Request Payload Structure
The registration endpoint requires the following fields in the request body:

| Field | Type | Constraints | Required |
|-------|------|-------------|----------|
| fullName | string | 2-100 characters | Yes |
| email | string | Valid email format | Yes |
| password | string | Minimum 6 characters, contains uppercase, lowercase, and number | Yes |

### Validation Rules
The system applies the following validation rules:
- Full name must be between 2 and 100 characters
- Email must be a valid format and normalized
- Password must be at least 6 characters long
- Password must contain at least one uppercase letter, one lowercase letter, and one number

### Response Format
On successful registration, the endpoint returns a 201 status code with the following response structure:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "farmer",
      "preferences": { /* user preferences */ },
      "profile": { /* user profile data */ },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

The response includes the user's public profile (excluding sensitive information like password) and a JWT authentication token for immediate login.

### Error Responses
The endpoint returns appropriate error codes for validation failures:
- **400 Bad Request**: Validation failed or user with email already exists
- **500 Internal Server Error**: Server error during registration

```mermaid
sequenceDiagram
participant Client
participant AuthController
participant User
participant JWT
Client->>AuthController : POST /api/auth/register
AuthController->>AuthController : Validate input
alt Validation fails
AuthController-->>Client : 400 with error details
else Valid input
AuthController->>User : Check if email exists
alt User exists
User-->>AuthController : Return existing user
AuthController-->>Client : 400 User already exists
else New user
AuthController->>User : Create new user
User->>User : Hash password (pre-save hook)
User-->>AuthController : Saved user
AuthController->>JWT : Generate token
JWT-->>AuthController : JWT token
AuthController->>User : Update last login
AuthController-->>Client : 201 with user data and token
end
end
```

**Diagram sources**
- [auth.js](file://HarvestIQ/backend/routes/auth.js#L48-L100)
- [User.js](file://HarvestIQ/backend/models/User.js#L1-L165)

**Section sources**
- [auth.js](file://HarvestIQ/backend/routes/auth.js#L48-L100)
- [User.js](file://HarvestIQ/backend/models/User.js#L1-L165)

## User Login

The login endpoint authenticates existing users and issues JWT tokens for subsequent requests.

### Endpoint Details
- **Method**: POST
- **Path**: `/api/auth/login`
- **Access**: Public
- **Success Status**: 200 OK

### Request Payload Structure
The login endpoint requires the following fields:

| Field | Type | Required |
|-------|------|----------|
| email | string | Yes |
| password | string | Yes |

### Authentication Process
The login process follows these steps:
1. Validate input parameters
2. Find user by email (including password field)
3. Compare provided password with stored hash
4. Generate JWT token upon successful authentication
5. Update user's last login timestamp
6. Return user profile and token

### Response Format
On successful authentication, the endpoint returns a 200 status code with the following response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "farmer",
      "preferences": { /* user preferences */ },
      "profile": { /* user profile data */ },
      "lastLogin": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Error Responses
- **400 Bad Request**: Validation failed
- **401 Unauthorized**: Invalid email or password
- **500 Internal Server Error**: Server error during login

```mermaid
sequenceDiagram
participant Client
participant AuthController
participant User
participant JWT
Client->>AuthController : POST /api/auth/login
AuthController->>AuthController : Validate input
alt Validation fails
AuthController-->>Client : 400 with error details
else Valid input
AuthController->>User : Find user by email with password
alt User not found
User-->>AuthController : null
AuthController-->>Client : 401 Invalid credentials
else User found
AuthController->>User : Compare password
alt Password invalid
User-->>AuthController : false
AuthController-->>Client : 401 Invalid credentials
else Password valid
AuthController->>JWT : Generate token
JWT-->>AuthController : JWT token
AuthController->>User : Update last login
AuthController-->>Client : 200 with user data and token
end
end
end
```

**Diagram sources**
- [auth.js](file://HarvestIQ/backend/routes/auth.js#L102-L157)
- [User.js](file://HarvestIQ/backend/models/User.js#L1-L165)

**Section sources**
- [auth.js](file://HarvestIQ/backend/routes/auth.js#L102-L157)
- [User.js](file://HarvestIQ/backend/models/User.js#L1-L165)

## Profile Management

The profile management endpoints allow authenticated users to retrieve and update their profile information.

### Get Profile Endpoint
- **Method**: GET
- **Path**: `/api/auth/profile`
- **Access**: Private (requires JWT)
- **Success Status**: 200 OK

#### Response Format
```json
{
  "success": true,
  "data": {
    "user": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "farmer",
      "preferences": { /* user preferences */ },
      "profile": { /* user profile data */ },
      "lastLogin": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Update Profile Endpoint
- **Method**: PUT
- **Path**: `/api/auth/profile`
- **Access**: Private (requires JWT)
- **Success Status**: 200 OK

#### Request Payload Structure
The update profile endpoint allows modification of the following fields:

| Field | Type | Description |
|-------|------|-------------|
| fullName | string | User's full name |
| preferences | object | User preferences (language, theme, notifications) |
| profile | object | User profile information (location, farming experience, etc.) |

#### Update Process
The system implements a whitelist approach to prevent unauthorized field updates:
1. Only specified fields in `allowedUpdates` array can be modified
2. Input validation is performed based on schema definitions
3. Updated user document is returned with success message

#### Response Format
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "farmer",
      "preferences": { /* updated preferences */ },
      "profile": { /* updated profile data */ },
      "lastLogin": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Error Responses
- **400 Bad Request**: Invalid update fields or validation errors
- **500 Internal Server Error**: Server error updating profile

```mermaid
classDiagram
class User {
+string fullName
+string email
+string role
+boolean isActive
+Date lastLogin
+Preferences preferences
+Profile profile
+Date createdAt
+Date updatedAt
+getPublicProfile() User
+updateLastLogin() Promise~User~
}
class Preferences {
+string language
+string theme
+Notifications notifications
}
class Notifications {
+boolean email
+boolean weather
+boolean market
}
class Profile {
+Location location
+number farmingExperience
+number farmSize
+string[] primaryCrops
+string farmingType
}
class Location {
+string state
+string district
+Coordinates coordinates
}
class Coordinates {
+number latitude
+number longitude
}
User --> Preferences : has
User --> Profile : has
Preferences --> Notifications : has
Profile --> Location : has
Location --> Coordinates : has
```

**Diagram sources**
- [User.js](file://HarvestIQ/backend/models/User.js#L1-L165)

**Section sources**
- [auth.js](file://HarvestIQ/backend/routes/auth.js#L159-L215)
- [User.js](file://HarvestIQ/backend/models/User.js#L1-L165)

## Password Management

The password management endpoint allows users to change their passwords securely.

### Change Password Endpoint
- **Method**: PUT
- **Path**: `/api/auth/change-password`
- **Access**: Private (requires JWT)
- **Success Status**: 200 OK

### Request Payload Structure
The endpoint requires the following fields:

| Field | Type | Required |
|-------|------|----------|
| currentPassword | string | Yes |
| newPassword | string | Yes |

### Password Change Process
The system implements the following security measures:
1. Verify current password before allowing change
2. Enforce minimum password length (6 characters)
3. Hash new password using BcryptJS before storage
4. Return success confirmation without sensitive information

### Response Format
On successful password change:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Error Responses
- **400 Bad Request**: Missing fields, current password incorrect, or new password too short
- **500 Internal Server Error**: Server error changing password

```mermaid
sequenceDiagram
participant Client
participant AuthController
participant User
Client->>AuthController : PUT /api/auth/change-password
AuthController->>AuthController : Validate input
alt Missing fields
AuthController-->>Client : 400 Missing required fields
else Valid input
AuthController->>User : Find user by ID with password
User-->>AuthController : User with password
AuthController->>User : Compare current password
alt Current password invalid
User-->>AuthController : false
AuthController-->>Client : 400 Current password incorrect
else Current password valid
AuthController->>User : Set new password
User->>User : Hash password (pre-save hook)
User->>User : Save user
User-->>AuthController : Saved user
AuthController-->>Client : 200 Password changed successfully
end
end
```

**Diagram sources**
- [auth.js](file://HarvestIQ/backend/routes/auth.js#L217-L274)
- [User.js](file://HarvestIQ/backend/models/User.js#L1-L165)

**Section sources**
- [auth.js](file://HarvestIQ/backend/routes/auth.js#L217-L274)
- [User.js](file://HarvestIQ/backend/models/User.js#L1-L165)

## Authentication Flow

The authentication system follows a comprehensive flow from user registration to protected resource access.

```mermaid
flowchart TD
A["User Registration"] --> B["Input Validation"]
B --> C["Check Email Availability"]
C --> D["Create User"]
D --> E["Hash Password"]
E --> F["Store User"]
F --> G["Generate JWT"]
G --> H["Return Token & Profile"]
I["User Login"] --> J["Input Validation"]
J --> K["Find User by Email"]
K --> L["Compare Password"]
L --> M["Generate JWT"]
M --> N["Update Last Login"]
N --> O["Return Token & Profile"]
P["Protected Route"] --> Q["Extract Bearer Token"]
Q --> R["Verify JWT"]
R --> S["Find User by ID"]
S --> T["Check User Active Status"]
T --> U["Attach User to Request"]
U --> V["Execute Route Handler"]
H --> W["Store Token Client-Side"]
O --> W
W --> X["Include Token in Headers"]
X --> P
```

**Diagram sources**
- [auth.js](file://HarvestIQ/backend/routes/auth.js#L1-L302)
- [middleware/auth.js](file://HarvestIQ/backend/middleware/auth.js#L1-L92)

**Section sources**
- [auth.js](file://HarvestIQ/backend/routes/auth.js#L1-L302)
- [middleware/auth.js](file://HarvestIQ/backend/middleware/auth.js#L1-L92)

## Security Considerations

The authentication system implements multiple security measures to protect user data and prevent common vulnerabilities.

### JWT Implementation
The system uses JSON Web Tokens for stateless authentication:
- Tokens are generated using HS256 algorithm
- Secret key stored in environment variable (`JWT_SECRET`)
- Default expiration of 7 days, configurable via `JWT_EXPIRE` environment variable
- Token verification includes user existence and active status checks

```javascript
// Token generation with configurable expiration
export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};
```

### Password Security
The system implements robust password security measures:
- Passwords are hashed using BcryptJS with salt rounds of 12
- Password field is excluded from default queries to prevent accidental exposure
- Password validation enforces complexity requirements (minimum length, mixed case, numbers)
- Pre-save middleware automatically hashes passwords before storage

### Input Validation
Comprehensive validation is implemented using express-validator:
- Registration: Full name length, email format, password complexity
- Login: Email format, password presence
- Profile updates: Field whitelisting to prevent unauthorized modifications
- Password changes: Current password verification, minimum length enforcement

### Rate Limiting
While not explicitly shown in the auth.js file, the package-lock.json indicates the presence of `express-rate-limit` (version 7.5.1), suggesting that rate limiting is implemented at the application level to prevent brute force attacks on authentication endpoints.

### Error Handling
The system implements consistent error handling:
- Validation errors return 400 with detailed error messages
- Authentication failures return 401 with generic messages to prevent information disclosure
- Server errors return 500 with minimal information in production
- All errors follow a consistent response format with success flag, message, and optional error details

**Section sources**
- [auth.js](file://HarvestIQ/backend/routes/auth.js#L1-L302)
- [middleware/auth.js](file://HarvestIQ/backend/middleware/auth.js#L1-L92)
- [User.js](file://HarvestIQ/backend/models/User.js#L1-L165)

## Integration with Frontend

The authentication routes are designed to work seamlessly with the frontend application through the API service layer.

### Frontend API Integration
The frontend uses an axios instance configured with interceptors to handle authentication:

```mermaid
sequenceDiagram
participant Frontend
participant API
participant Backend
Frontend->>API : Request with auth token
API->>API : Add Authorization header
API->>Backend : Forward request
Backend->>Backend : Verify token
alt Token valid
Backend-->>API : Response with data
API-->>Frontend : Return data
else Token invalid/expired
Backend-->>API : 401 Unauthorized
API->>API : Remove token from localStorage
API->>Frontend : Redirect to login
end
```

### Token Management
The frontend implements the following token management practices:
- Store JWT in localStorage with key 'harvestiq_token'
- Include token in Authorization header for all authenticated requests
- Automatically remove token on 401 responses (token expiration)
- Redirect to login page when authentication is required

### Example Usage
```javascript
// Register new user
const register = async (userData) => {
  try {
    const response = await API.post('/auth/register', userData);
    // Store token and user data
    localStorage.setItem('harvestiq_token', response.data.token);
    localStorage.setItem('harvestiq_user', JSON.stringify(response.data.user));
    return response.data;
  } catch (error) {
    throw error;
  }
};
```

**Diagram sources**
- [api.js](file://HarvestIQ/src/services/api.js#L1-L52)

**Section sources**
- [api.js](file://HarvestIQ/src/services/api.js#L1-L52)
- [auth.js](file://HarvestIQ/backend/routes/auth.js#L1-L302)

## Error Handling

The authentication system implements comprehensive error handling to provide meaningful feedback while maintaining security.

### Error Response Structure
All error responses follow a consistent format:

```json
{
  "success": false,
  "message": "Descriptive error message",
  "errors": [ /* validation errors, if applicable */ ]
}
```

### Error Types and Status Codes
The system uses appropriate HTTP status codes for different error conditions:

| Status Code | Scenario | Example Message |
|-------------|---------|----------------|
| 400 | Validation failure or bad request | "Validation failed", "Current password is incorrect" |
| 401 | Authentication failure | "Invalid email or password", "Access denied. No token provided." |
| 403 | Authorization failure | "Access denied. Insufficient permissions." |
| 500 | Server errors | "Server error during registration" |

### Development vs Production
The system differentiates between development and production environments:
- In development: Error responses include detailed error messages for debugging
- In production: Error responses provide minimal information to prevent information disclosure

### Middleware Error Handling
The authentication middleware includes comprehensive error handling:
- Token verification errors return 401 with "Token invalid or expired" message
- User not found or inactive users return 401 with appropriate messaging
- Server errors in middleware return 500 with generic error message

**Section sources**
- [auth.js](file://HarvestIQ/backend/routes/auth.js#L1-L302)
- [middleware/auth.js](file://HarvestIQ/backend/middleware/auth.js#L1-L92)