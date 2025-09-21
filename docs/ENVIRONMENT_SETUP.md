# Environment Setup Guide

This document outlines the environment variables required to run the Telecheck healthcare application.

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

### Database Configuration

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=telecheck
DB_USER=postgres
DB_PASSWORD=password
DB_MAX_CONNECTIONS=20
```

### Redis Configuration

```env
REDIS_URL=redis://localhost:6379
```

### JWT Configuration

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Server Configuration

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### File Upload Configuration

```env
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Email Configuration (for password reset, notifications)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@telecheck.com
```

### AI Service Configuration

```env
AI_SERVICE_URL=https://api.openai.com/v1
AI_SERVICE_KEY=your-openai-api-key
```

### FHIR Configuration

```env
FHIR_BASE_URL=https://fhir.example.com
FHIR_CLIENT_ID=your-fhir-client-id
FHIR_CLIENT_SECRET=your-fhir-client-secret
```

### Wearable Integration

```env
APPLE_HEALTH_CLIENT_ID=your-apple-health-client-id
FITBIT_CLIENT_ID=your-fitbit-client-id
FITBIT_CLIENT_SECRET=your-fitbit-client-secret
```

### Telemedicine Configuration

```env
VIDEO_SERVICE_URL=https://video.example.com
VIDEO_API_KEY=your-video-api-key
```

### Security Configuration

```env
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Test Configuration

```env
TEST_DB_HOST=localhost
TEST_DB_PORT=5432
TEST_DB_NAME=telecheck_test
TEST_DB_USER=postgres
TEST_DB_PASSWORD=password
TEST_REDIS_URL=redis://localhost:6379/1
```

## Setup Instructions

1. **Install Dependencies**: Run `npm install` to install all required packages.

2. **Database Setup**:
   - Install PostgreSQL and Redis
   - Create a database named `telecheck`
   - Create a test database named `telecheck_test`

3. **Environment File**: Copy the variables above into a `.env` file in the root directory.

4. **Database Migration**: The application will automatically create tables on first run.

5. **Start Development Server**: Run `npm run dev` to start the development server.

## Security Notes

- **JWT_SECRET**: Use a strong, random string in production
- **Database Passwords**: Use strong passwords in production
- **API Keys**: Keep all API keys secure and never commit them to version control
- **HTTPS**: Always use HTTPS in production environments

## Production Considerations

- Use environment-specific configuration files
- Implement proper logging and monitoring
- Set up database backups
- Configure rate limiting appropriately
- Use secure session management
- Implement proper CORS policies
