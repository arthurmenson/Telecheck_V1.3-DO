# User and Role Management Guide - Telecheck V2.0

**Last Updated**: 2025-10-25
**Version**: 2.0.0

---

## Overview

Telecheck V2.0 has a comprehensive user and role management system with both **public registration** and **admin-managed user creation**. This guide explains where users are created, how roles are assigned, and how to manage them.

---

## Where Users Are Created

### 1. Public Self-Registration ✅

**Endpoint**: `POST /api/auth/register`

**File**: [server/routes/auth.ts](server/routes/auth.ts:36-117)

**How it works**:

- Users can register themselves through the public registration form
- They provide: email, password, first name, last name, role, phone
- Password is hashed with bcrypt (12 rounds)
- User is inserted into the `users` table
- JWT tokens are generated automatically
- User gets immediate access

**API Request**:

```typescript
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "StrongPass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "patient",  // or "doctor", "pharmacist", "admin"
  "phone": "+1234567890"
}
```

**API Response**:

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "patient"
  },
  "token": "jwt-access-token",
  "refreshToken": "jwt-refresh-token"
}
```

**Security Features**:

- Checks if email already exists (409 error if duplicate)
- Password hashed with bcrypt (saltRounds: 12)
- JWT tokens with 24h expiration (access) and 7d (refresh)
- Refresh tokens stored in Redis

---

### 2. Admin User Invitation ✅

**Endpoint**: `POST /api/users/invite`

**File**: [server/routes/users.ts](server/routes/users.ts:252-322)

**How it works**:

- **Admin-only** endpoint (requires admin role)
- Admin provides user details (email, name, role, phone)
- System generates a temporary password automatically
- User is created with `is_active = true`
- TODO: Invitation email sent (currently not implemented)

**API Request**:

```typescript
POST /api/users/invite
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "email": "newdoctor@hospital.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "doctor",
  "phone": "+1987654321"
}
```

**API Response**:

```json
{
  "message": "User invited successfully",
  "user": {
    "id": "uuid-here",
    "email": "newdoctor@hospital.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "doctor"
  }
}
```

**Temporary Password**:

- Auto-generated: 8 random chars + 4 uppercase + "1"
- Example: `k7j2m9p5XYZW1`
- User should change on first login
- Currently returned in response (should be emailed instead)

---

### 3. Database Initialization ✅

**File**: [server/config/init.sql](server/config/init.sql:181-189)

**Default Admin User**:

```sql
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
VALUES (
  'admin@telecheck.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8O',
  'Admin',
  'User',
  'admin',
  true
) ON CONFLICT (email) DO NOTHING;
```

**Credentials**:

- Email: `admin@telecheck.com`
- Password: `admin123`
- Role: `admin`

**⚠️ IMPORTANT**: Change this password immediately in production!

---

## Available Roles

### Role Types

Defined in database schema: [server/config/init.sql](server/config/init.sql:14)

```sql
role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor', 'pharmacist', 'admin'))
```

### Role Descriptions

1. **patient** 🏥
   - End users seeking medical care
   - Can view own health records
   - Can book appointments
   - Can upload lab reports
   - Can track medications

2. **doctor** 👨‍⚕️
   - Medical professionals
   - Can view patient records (with permission)
   - Can create prescriptions
   - Can review lab results
   - Can conduct video consultations

3. **pharmacist** 💊
   - Pharmacy staff
   - Can view prescriptions
   - Can update medication status
   - Can verify medication interactions

4. **admin** 👑
   - System administrators
   - Full access to all features
   - User management capabilities
   - System configuration
   - View analytics and reports

---

## User Management Endpoints

### For Admins Only

All endpoints in [server/routes/users.ts](server/routes/users.ts) require `admin` role.

#### 1. List All Users

```
GET /api/users
Authorization: Bearer <admin-token>
Query: ?page=1&limit=20&q=search-term
```

**Features**:

- Pagination support (page, limit)
- Search by email, first name, or last name
- Returns user list with metadata
- Shows active/inactive status

**Response**:

```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "patient",
      "isActive": true,
      "lastLoginAt": "2025-10-25T12:00:00Z",
      "createdAt": "2025-10-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalUsers": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

#### 2. Get User by ID

```
GET /api/users/:id
Authorization: Bearer <admin-token>
```

**Returns**: Full user details for specific user

#### 3. Update User

```
PUT /api/users/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "firstName": "Updated",
  "lastName": "Name",
  "phone": "+1234567890",
  "role": "doctor",
  "isActive": true
}
```

**Features**:

- Update user profile information
- Change user role
- Activate/deactivate user account

#### 4. Delete User (Soft Delete)

```
DELETE /api/users/:id
Authorization: Bearer <admin-token>
```

**How it works**:

- **Soft delete** - sets `is_active = false`
- User data preserved in database
- User cannot log in
- Can be reactivated by admin

**NOT a hard delete**: Data is retained for compliance/audit purposes

#### 5. Get User Statistics

```
GET /api/users/stats/overview
Authorization: Bearer <admin-token>
```

**Returns**:

```json
{
  "stats": {
    "totalUsers": 250,
    "activeUsers": 230,
    "inactiveUsers": 20,
    "patients": 180,
    "doctors": 45,
    "pharmacists": 15,
    "admins": 10,
    "activeLast7Days": 120,
    "activeLast30Days": 210
  }
}
```

---

## How to Manage Users

### Option 1: Via API Endpoints (Current)

**Prerequisites**:

- Admin account with JWT token
- API client (Postman, curl, or frontend)

**Example Flow**:

1. **Login as Admin**:

```bash
curl -X POST https://whale-app-bs3xa.ondigitalocean.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@telecheck.com","password":"admin123"}'
```

2. **Invite New Doctor**:

```bash
curl -X POST https://whale-app-bs3xa.ondigitalocean.app/api/users/invite \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "email": "dr.smith@hospital.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "doctor",
    "phone": "+1234567890"
  }'
```

3. **List All Users**:

```bash
curl -X GET "https://whale-app-bs3xa.ondigitalocean.app/api/users?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

4. **Update User Role**:

```bash
curl -X PUT https://whale-app-bs3xa.ondigitalocean.app/api/users/USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"role": "doctor", "isActive": true}'
```

5. **Deactivate User**:

```bash
curl -X DELETE https://whale-app-bs3xa.ondigitalocean.app/api/users/USER_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### Option 2: Via Admin UI (Recommended - Needs Implementation)

**Current Status**: ❌ Not implemented yet

**What's Needed**: A User Management page in the admin panel with:

1. **User List View**
   - Table showing all users
   - Search/filter functionality
   - Pagination controls
   - Quick actions (edit, deactivate)

2. **User Detail/Edit Form**
   - Edit user information
   - Change role dropdown
   - Activate/deactivate toggle
   - Reset password button

3. **Invite User Form**
   - Create new user
   - Assign role
   - Send invitation email

4. **User Statistics Dashboard**
   - Total users by role
   - Active/inactive counts
   - Recent activity

**Location**: Should be added to Admin Settings or as a separate Admin → Users page

---

## Role-Based Access Control (RBAC)

### Middleware

**File**: [server/middleware/auth.ts](server/middleware/auth.ts)

```typescript
// Verify JWT token
export const authenticateToken = (req, res, next) => { ... }

// Require admin role
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}
```

### Usage in Routes

```typescript
// Public endpoint
router.post("/auth/register", registerHandler);

// Protected endpoint (any authenticated user)
router.get("/auth/profile", authenticateToken, getProfileHandler);

// Admin-only endpoint
router.get("/users", authenticateToken, requireAdmin, getAllUsersHandler);
```

---

## Database Schema

### Users Table

**File**: [server/config/init.sql](server/config/init.sql:8-23)

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor', 'pharmacist', 'admin')),
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes**:

```sql
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
```

---

## Best Practices

### For User Creation

1. **Email Validation**
   - Always validate email format
   - Check for duplicates before creation
   - Use lowercase for consistency

2. **Password Security**
   - Minimum 12 characters
   - Require mixed case, numbers, symbols
   - Hash with bcrypt (12 rounds)
   - Never log or display passwords

3. **Role Assignment**
   - Validate role is in allowed list
   - Start with least privilege (patient)
   - Only admins can create admin users
   - Log role changes for audit

4. **User Invitations**
   - Generate strong temporary passwords
   - Send via secure email (not SMS)
   - Set expiration on invitation
   - Force password change on first login

### For User Management

1. **Soft Delete**
   - Use `is_active = false` instead of DELETE
   - Preserve data for compliance
   - Can reactivate if needed
   - Hard delete only after retention period

2. **Audit Trail**
   - Log all user creation events
   - Log role changes
   - Log account activations/deactivations
   - Include admin who made the change

3. **Access Control**
   - User management requires admin role
   - Validate JWT tokens on every request
   - Check role in middleware
   - Return 403 for unauthorized access

---

## Frontend Implementation Needed

### User Management UI (TODO)

Create a new page: `client/pages/admin/UserManagement.tsx`

**Features to implement**:

1. **User List Table**

   ```typescript
   - Columns: Name, Email, Role, Status, Last Login, Actions
   - Search bar
   - Filter by role (all, patient, doctor, pharmacist, admin)
   - Filter by status (all, active, inactive)
   - Pagination
   ```

2. **Actions Menu**

   ```typescript
   - Edit user (modal or separate page)
   - Change role (dropdown)
   - Deactivate/Activate toggle
   - Reset password button
   - Delete (with confirmation)
   ```

3. **Invite User Button**

   ```typescript
   - Opens modal/form
   - Fields: email, firstName, lastName, role, phone
   - Sends to POST /api/users/invite
   - Shows success message with temp password
   ```

4. **User Statistics Cards**
   ```typescript
   - Total Users
   - Active Users
   - Users by Role (pie chart)
   - Recent Activity (last 7/30 days)
   ```

---

## Quick Reference

### Create User (Public Registration)

```bash
POST /api/auth/register
Body: { email, password, firstName, lastName, role, phone }
```

### Create User (Admin Invitation)

```bash
POST /api/users/invite (Admin only)
Body: { email, firstName, lastName, role, phone }
```

### List Users

```bash
GET /api/users?page=1&limit=20&q=search (Admin only)
```

### Update User

```bash
PUT /api/users/:id (Admin only)
Body: { firstName, lastName, phone, role, isActive }
```

### Deactivate User

```bash
DELETE /api/users/:id (Admin only)
```

### Change Role

```bash
PUT /api/users/:id (Admin only)
Body: { role: "doctor" }
```

### Get Statistics

```bash
GET /api/users/stats/overview (Admin only)
```

---

## Summary

**Users can be created in 3 ways:**

1. ✅ **Self-registration**: `POST /api/auth/register` (public)
2. ✅ **Admin invitation**: `POST /api/users/invite` (admin-only)
3. ✅ **Database seed**: Default admin in `init.sql`

**Roles are assigned:**

- During registration (user chooses)
- During invitation (admin chooses)
- Can be changed later (admin only via `PUT /api/users/:id`)

**User management is done via:**

- ✅ **API endpoints** in `server/routes/users.ts` (currently available)
- ❌ **Admin UI** (needs to be created in frontend)

**Next steps to complete user management**:

1. Create User Management UI page
2. Implement email sending for invitations
3. Add password reset functionality in UI
4. Add bulk user import (CSV)
5. Add user activity logs viewer

---

_Last Updated: 2025-10-25_
_Version: 2.0.0_
_Database: PostgreSQL 15 (telecheck-postgres-cluster)_
