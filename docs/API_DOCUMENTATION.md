# Telecheck API Documentation

This document provides comprehensive documentation for the Telecheck healthcare management platform API.

## Base URL
```
Development: http://localhost:3000/api
Production: https://api.telecheck.com/api
```

## Authentication

All API endpoints require authentication unless specified otherwise. Use JWT tokens in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "error": null
}
```

Error responses:

```json
{
  "success": false,
  "data": null,
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}
```

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "patient",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "patient"
  },
  "token": "jwt-token",
  "refreshToken": "refresh-token"
}
```

### Login User
**POST** `/auth/login`

Authenticate user and receive access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "patient"
  },
  "token": "jwt-token",
  "refreshToken": "refresh-token"
}
```

### Refresh Token
**POST** `/auth/refresh`

Refresh expired access token.

**Request Body:**
```json
{
  "refreshToken": "refresh-token"
}
```

**Response:**
```json
{
  "message": "Token refreshed successfully",
  "token": "new-jwt-token"
}
```

### Logout User
**POST** `/auth/logout`

Logout user and invalidate tokens.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "message": "Logout successful"
}
```

### Get User Profile
**GET** `/auth/profile`

Get current user's profile information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "patient",
    "phone": "+1234567890",
    "avatarUrl": "https://example.com/avatar.jpg",
    "lastLoginAt": "2024-01-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Update User Profile
**PUT** `/auth/profile`

Update current user's profile information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1987654321"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "patient",
    "phone": "+1987654321",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

## User Management Endpoints (Admin Only)

### List All Users
**GET** `/users?page=1&limit=20&q=search`

Get paginated list of all users.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `q` (optional): Search query for email, first name, or last name

**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "patient",
      "phone": "+1234567890",
      "isActive": true,
      "lastLoginAt": "2024-01-01T00:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalUsers": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### Get User by ID
**GET** `/users/:id`

Get specific user by ID.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "patient",
    "phone": "+1234567890",
    "avatarUrl": "https://example.com/avatar.jpg",
    "isActive": true,
    "lastLoginAt": "2024-01-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Update User
**PUT** `/users/:id`

Update specific user information.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "doctor",
  "isActive": true
}
```

**Response:**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "doctor",
    "isActive": true,
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Delete User
**DELETE** `/users/:id`

Soft delete user (set isActive to false).

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Response:**
```json
{
  "message": "User deactivated successfully"
}
```

## Patient Management Endpoints

### List All Patients
**GET** `/patients?page=1&limit=20&q=search`

Get paginated list of all patients (doctors and admins only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `q` (optional): Search query for name or email

**Response:**
```json
{
  "patients": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "email": "patient@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "dateOfBirth": "1990-01-01",
      "gender": "male",
      "bloodType": "A+",
      "allergies": ["penicillin", "peanuts"],
      "emergencyContacts": [
        {
          "name": "Jane Doe",
          "relationship": "Spouse",
          "phone": "+1234567890"
        }
      ],
      "insuranceInfo": {
        "provider": "Blue Cross",
        "policyNumber": "123456789"
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPatients": 50,
    "totalPages": 3,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### Get Patient by ID
**GET** `/patients/:id`

Get specific patient by ID.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "patient": {
    "id": "uuid",
    "userId": "user-uuid",
    "email": "patient@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "patient",
    "dateOfBirth": "1990-01-01",
    "gender": "male",
    "bloodType": "A+",
    "allergies": ["penicillin", "peanuts"],
    "emergencyContacts": [],
    "insuranceInfo": {},
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Create Patient Record
**POST** `/patients`

Create a new patient record.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "userId": "user-uuid",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "bloodType": "A+",
  "allergies": ["penicillin"],
  "emergencyContacts": [
    {
      "name": "Jane Doe",
      "relationship": "Spouse",
      "phone": "+1234567890"
    }
  ],
  "insuranceInfo": {
    "provider": "Blue Cross",
    "policyNumber": "123456789"
  }
}
```

**Response:**
```json
{
  "message": "Patient record created successfully",
  "patient": {
    "id": "uuid",
    "userId": "user-uuid",
    "dateOfBirth": "1990-01-01",
    "gender": "male",
    "bloodType": "A+",
    "allergies": ["penicillin"],
    "emergencyContacts": [],
    "insuranceInfo": {},
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Update Patient Record
**PUT** `/patients/:id`

Update specific patient record.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "bloodType": "O+",
  "allergies": ["penicillin", "peanuts"]
}
```

**Response:**
```json
{
  "message": "Patient record updated successfully",
  "patient": {
    "id": "uuid",
    "userId": "user-uuid",
    "dateOfBirth": "1990-01-01",
    "gender": "male",
    "bloodType": "O+",
    "allergies": ["penicillin", "peanuts"],
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Delete Patient Record
**DELETE** `/patients/:id`

Delete patient record.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "message": "Patient record deleted successfully"
}
```

## Lab Management Endpoints

### Get Lab Reports
**GET** `/labs/reports/:userId?page=1&limit=20`

Get paginated list of lab reports for a user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response:**
```json
{
  "reports": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "fileName": "blood_test.pdf",
      "fileSize": 1024000,
      "fileUrl": "https://example.com/uploads/blood_test.pdf",
      "uploadDate": "2024-01-01T00:00:00Z",
      "analysisStatus": "completed",
      "aiSummary": "Normal blood test results with all values within reference ranges.",
      "confidence": 0.95,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalReports": 10,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

### Upload Lab Report
**POST** `/labs/upload`

Upload a new lab report for analysis.

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Form Data:**
- `labReport`: File (PDF, JPEG, PNG)

**Response:**
```json
{
  "message": "Lab report uploaded successfully. Analysis in progress.",
  "report": {
    "id": "uuid",
    "userId": "user-uuid",
    "fileName": "blood_test.pdf",
    "fileSize": 1024000,
    "fileUrl": "https://example.com/uploads/blood_test.pdf",
    "analysisStatus": "pending",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Get Lab Results
**GET** `/labs/results/:reportId`

Get lab results for a specific report.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "labReportId": "report-uuid",
      "testName": "Hemoglobin",
      "value": 14.2,
      "unit": "g/dL",
      "referenceRange": "13.5-17.5",
      "status": "normal",
      "testDate": "2024-01-01",
      "labName": "LabCorp",
      "doctorNotes": "Normal hemoglobin levels",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Add Lab Results Manually
**POST** `/labs/results`

Add lab results manually to a report.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "labReportId": "report-uuid",
  "testName": "Hemoglobin",
  "value": 14.2,
  "unit": "g/dL",
  "referenceRange": "13.5-17.5",
  "status": "normal",
  "testDate": "2024-01-01",
  "labName": "LabCorp",
  "doctorNotes": "Normal hemoglobin levels"
}
```

**Response:**
```json
{
  "message": "Lab result added successfully",
  "result": {
    "id": "uuid",
    "labReportId": "report-uuid",
    "testName": "Hemoglobin",
    "value": 14.2,
    "unit": "g/dL",
    "referenceRange": "13.5-17.5",
    "status": "normal",
    "testDate": "2024-01-01",
    "labName": "LabCorp",
    "doctorNotes": "Normal hemoglobin levels",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

## Medication Management Endpoints

### Get Medications
**GET** `/medications/:userId?page=1&limit=20`

Get paginated list of medications for a user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response:**
```json
{
  "medications": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "name": "Lisinopril",
      "dosage": "10mg",
      "frequency": "Once daily",
      "startDate": "2024-01-01",
      "endDate": null,
      "prescribedBy": "Dr. Smith",
      "instructions": "Take in the morning",
      "sideEffects": ["dizziness", "dry cough"],
      "interactions": ["ibuprofen"],
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalMedications": 5,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

### Add Medication
**POST** `/medications`

Add a new medication for a user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "userId": "user-uuid",
  "name": "Lisinopril",
  "dosage": "10mg",
  "frequency": "Once daily",
  "startDate": "2024-01-01",
  "endDate": null,
  "prescribedBy": "Dr. Smith",
  "instructions": "Take in the morning",
  "sideEffects": ["dizziness", "dry cough"],
  "interactions": ["ibuprofen"]
}
```

**Response:**
```json
{
  "message": "Medication added successfully",
  "medication": {
    "id": "uuid",
    "userId": "user-uuid",
    "name": "Lisinopril",
    "dosage": "10mg",
    "frequency": "Once daily",
    "startDate": "2024-01-01",
    "endDate": null,
    "prescribedBy": "Dr. Smith",
    "instructions": "Take in the morning",
    "sideEffects": ["dizziness", "dry cough"],
    "interactions": ["ibuprofen"],
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Update Medication
**PUT** `/medications/:id`

Update specific medication.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "dosage": "20mg",
  "instructions": "Take in the morning with food"
}
```

**Response:**
```json
{
  "message": "Medication updated successfully",
  "medication": {
    "id": "uuid",
    "userId": "user-uuid",
    "name": "Lisinopril",
    "dosage": "20mg",
    "frequency": "Once daily",
    "startDate": "2024-01-01",
    "endDate": null,
    "prescribedBy": "Dr. Smith",
    "instructions": "Take in the morning with food",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Delete Medication
**DELETE** `/medications/:id`

Delete medication.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "message": "Medication deleted successfully"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `TOKEN_MISSING` | Authorization token is required |
| `TOKEN_INVALID` | Invalid or expired token |
| `TOKEN_EXPIRED` | Token has expired |
| `USER_INVALID` | User not found or inactive |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `VALIDATION_ERROR` | Request validation failed |
| `USER_EXISTS` | User already exists |
| `USER_NOT_FOUND` | User not found |
| `PATIENT_EXISTS` | Patient record already exists |
| `PATIENT_NOT_FOUND` | Patient not found |
| `REPORT_NOT_FOUND` | Lab report not found |
| `MISSING_FIELDS` | Required fields are missing |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Internal server error |

## Rate Limiting

API requests are limited to:
- 100 requests per 15 minutes per IP address
- 1000 requests per hour per authenticated user

## Pagination

All list endpoints support pagination with the following parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

Response includes pagination metadata:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

## File Upload

File uploads are supported for:
- Lab reports (PDF, JPEG, PNG)
- Maximum file size: 10MB
- Files are stored securely and accessible via signed URLs

## Security

- All endpoints use HTTPS in production
- JWT tokens expire after 24 hours
- Refresh tokens expire after 7 days
- Passwords are hashed using bcrypt
- Input validation and sanitization on all endpoints
- CORS protection enabled
- Rate limiting to prevent abuse
