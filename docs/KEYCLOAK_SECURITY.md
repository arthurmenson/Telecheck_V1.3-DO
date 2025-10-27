# Keycloak Security Configuration Guide

## Table of Contents

1. [Security Overview](#security-overview)
2. [Authentication Security](#authentication-security)
3. [Authorization Security](#authorization-security)
4. [Session Security](#session-security)
5. [HIPAA Compliance](#hipaa-compliance)
6. [API Security](#api-security)
7. [Security Monitoring](#security-monitoring)
8. [Incident Response](#incident-response)

## Security Overview

This document outlines the security architecture and best practices for the TeleCheck Keycloak integration. The implementation follows OWASP Top 10 guidelines and HIPAA compliance requirements.

### Security Principles Applied

1. **Defense in Depth**: Multiple layers of security controls
2. **Least Privilege**: Users have minimum necessary permissions
3. **Zero Trust**: Verify every request, trust nothing
4. **Secure by Default**: Security features enabled out of the box
5. **Audit Everything**: Comprehensive logging for compliance

### Threat Model

**Protected Assets**:

- Patient Health Information (PHI)
- User credentials and authentication tokens
- Healthcare provider credentials
- System configuration and secrets

**Threat Actors**:

- External attackers (unauthorized access attempts)
- Malicious insiders (privilege abuse)
- Compromised user accounts
- Man-in-the-middle attacks

**Attack Vectors**:

- Credential theft (phishing, brute force)
- Token interception and replay
- Session hijacking
- Authorization bypass
- Code injection (XSS, SQLi)

## Authentication Security

### PKCE (Proof Key for Code Exchange)

**Implementation**: All OAuth 2.0 flows use PKCE with S256 challenge method

**Security Benefits**:

- Prevents authorization code interception attacks
- Protects against CSRF attacks
- Secures public clients without client secrets

**How It Works**:

```
1. Client generates code_verifier (random 43-128 char string)
2. Client creates code_challenge = SHA256(code_verifier)
3. Authorization request includes code_challenge
4. Keycloak stores code_challenge with authorization code
5. Token exchange requires original code_verifier
6. Keycloak validates: SHA256(code_verifier) == code_challenge
```

**Files Implementing PKCE**:

- `server/routes/keycloak-auth.ts` (generatePKCE function)

### Token Validation

**Access Token Validation**:

- Algorithm: RS256 (RSA signature with SHA-256)
- Issuer validation: Matches Keycloak realm
- Audience validation: Matches client ID
- Expiration check: Tokens expire after 15 minutes
- Not-before check: Token not valid before issue time

**Refresh Token Security**:

- Rotation: New refresh token issued on every refresh
- One-time use: Previous refresh token invalidated immediately
- Shorter lifespan: 30 minutes (configurable)
- Secure storage: HttpOnly cookies (not localStorage)

**Token Introspection**:
Used for sensitive operations (password change, role modification):

```typescript
// Requires network call to Keycloak to verify token status
await introspectToken(token);
// Checks: active status, expiration, user status
```

**Files Implementing Token Validation**:

- `server/config/keycloak.ts` (verifyKeycloakToken function)
- `server/middleware/keycloak-auth.ts` (requireTokenIntrospection)

### JWT Security

**Header Validation**:

```json
{
  "alg": "RS256", // Algorithm - must be RS256
  "typ": "JWT", // Type
  "kid": "xxx" // Key ID for signature verification
}
```

**Claims Validation**:

```json
{
  "iss": "https://keycloak.telecheck.health/realms/telecheck",
  "aud": "telecheck-web",
  "sub": "user-id",
  "exp": 1234567890, // Expiration time
  "iat": 1234567890, // Issued at
  "nbf": 1234567890, // Not before
  "realm_access": {
    "roles": ["PATIENT"]
  }
}
```

**Signature Verification**:

- Uses JWKS (JSON Web Key Set) from Keycloak
- Public keys cached for 1 hour
- Automatic key rotation support
- Stale key fallback for availability

### Password Security

**Password Policy** (enforced by Keycloak):

```
- Minimum length: 12 characters
- Complexity requirements:
  * At least 1 uppercase letter
  * At least 1 lowercase letter
  * At least 1 digit
  * At least 1 special character
- Cannot contain username
- Password history: Last 3 passwords remembered
- Password expiry: 90 days (configurable)
```

**Password Storage**:

- Algorithm: PBKDF2 with HMAC-SHA256
- Salt: Unique per password, cryptographically random
- Iterations: 27,500 (Keycloak default)
- Never stored in plaintext
- Never logged or transmitted in logs

**Password Reset**:

- Secure reset link with time-limited token
- Email verification required
- Old password invalidated immediately
- Audit log entry created
- Rate limited: 5 attempts per hour

### Brute Force Protection

**Configuration** (Keycloak realm settings):

```yaml
Brute Force Protection: Enabled
Failure Factor: 5 failed attempts
Permanent Lockout: Disabled
Wait Increment: 60 seconds
Max Wait: 900 seconds (15 minutes)
Quick Login Check: 1000ms
Max Delta Time: 43200 seconds (12 hours)
```

**Protection Mechanisms**:

1. **IP-based rate limiting**: 10 login attempts per 15 minutes
2. **User account lockout**: After 5 failed attempts
3. **Temporary lockout**: Increases exponentially (60s, 120s, 240s...)
4. **CAPTCHA**: After 3 failed attempts (optional)
5. **Audit logging**: All failed attempts logged

**Files Implementing Rate Limiting**:

- `server/middleware/security-enhanced.ts` (authRateLimit)

## Authorization Security

### Role-Based Access Control (RBAC)

**Role Hierarchy**:

```
ADMIN
  ├── Full system access
  └── User management

DOCTOR / PROVIDER
  ├── Patient records (read/write)
  ├── Prescriptions (write)
  └── Consultations (read/write)

NURSE / FIELD_NURSE
  ├── Patient records (read)
  ├── Vital monitoring (read/write)
  └── Care coordination

PHARMACIST
  ├── Prescriptions (read/dispense)
  └── Inventory management

PATIENT
  └── Own records (read)
```

**Permission Checks**:

```typescript
// Require specific role
app.get(
  "/api/admin/users",
  authenticateKeycloak,
  requireRole(["ADMIN"]),
  handler,
);

// Require any of multiple roles
app.get(
  "/api/patients/:id",
  authenticateKeycloak,
  requireRole(["DOCTOR", "NURSE", "ADMIN"]),
  handler,
);

// Require all specified roles
app.post(
  "/api/sensitive-operation",
  authenticateKeycloak,
  requireAllRoles(["ADMIN", "SECURITY_OFFICER"]),
  handler,
);
```

**Files Implementing RBAC**:

- `server/middleware/keycloak-auth.ts` (requireRole, requireAllRoles)

### MFA Enforcement

**MFA Required For**:

- DOCTOR / PROVIDER role
- ADMIN role
- NURSE / FIELD_NURSE role
- Access to sensitive patient data
- Administrative operations

**MFA Methods**:

1. **TOTP (Time-based One-Time Password)**: Primary method
   - Algorithm: HMAC-SHA1
   - Digits: 6
   - Period: 30 seconds
   - Compatible apps: Google Authenticator, Authy, Microsoft Authenticator

2. **Backup Codes**: 10 single-use codes
   - Generated during MFA setup
   - Stored hashed in Keycloak
   - Used when primary method unavailable

**MFA Enforcement Flow**:

```
1. User logs in with username/password
2. Keycloak checks user's roles
3. If role requires MFA:
   a. Check if MFA configured
   b. If not configured: Redirect to MFA setup
   c. If configured: Prompt for OTP
4. Validate OTP
5. Issue access token with ACR (Authentication Context Class) claim
6. Application validates ACR level on sensitive operations
```

**ACR (Authentication Context Class) Levels**:

- `0`: No MFA
- `1`: MFA configured but not used this session
- `2`: MFA verified this session (required for providers)

**Files Implementing MFA**:

- `server/middleware/keycloak-auth.ts` (requireMFA)
- `server/routes/keycloak-auth.ts` (mfa-setup endpoint)

### Scope-Based Access

**OAuth Scopes Implemented**:

- `openid`: Required for authentication
- `profile`: User profile information
- `email`: User email address
- `roles`: User role assignments
- `offline_access`: Refresh token issuance

**Scope Validation**:

```typescript
// Check if token has required scope
if (!user.permissions.includes("offline_access")) {
  throw new Error("Refresh token not available");
}
```

## Session Security

### Session Management

**Session Configuration**:

```yaml
SSO Session Idle Timeout: 1800 seconds (30 minutes)
SSO Session Max Lifespan: 36000 seconds (10 hours)
Offline Session Idle Timeout: 2592000 seconds (30 days)
Client Session Idle Timeout: 0 (uses SSO session)
Client Session Max Lifespan: 0 (uses SSO session)
```

**Session Security Features**:

1. **Idle Timeout**: Session expires after 30 minutes of inactivity
2. **Max Lifespan**: Absolute session limit of 10 hours
3. **Concurrent Session Control**: Configurable max sessions per user
4. **Session Revocation**: Admin can terminate sessions
5. **Device Tracking**: Track session creation IP and user agent

**Session Storage**:

- **Server-side**: Keycloak stores session in database
- **Client-side**: Session ID in HttpOnly cookie
- **No localStorage**: Prevents XSS token theft

### Secure Cookie Configuration

**Cookie Attributes**:

```typescript
{
  httpOnly: true,      // Prevents JavaScript access (XSS protection)
  secure: true,        // HTTPS only in production
  sameSite: 'strict',  // CSRF protection
  maxAge: 900000,      // 15 minutes (matches token lifespan)
  path: '/',
  domain: '.telecheck.health'
}
```

**Token Storage Strategy**:

```
❌ localStorage - Vulnerable to XSS
❌ sessionStorage - Vulnerable to XSS
✅ HttpOnly cookies - Protected from JavaScript access
✅ Secure flag - HTTPS transmission only
✅ SameSite - CSRF protection
```

### Logout Security

**Logout Types**:

1. **Local Logout**:

```typescript
// Revoke refresh token
POST / api / auth / keycloak / logout;
// Clear local session
// Redirect to login page
```

2. **Keycloak Logout**:

```typescript
// End Keycloak session
GET https://keycloak.../protocol/openid-connect/logout
// Revokes all tokens
// Ends SSO session
```

3. **Back-Channel Logout**:

```typescript
// Keycloak notifies application of logout
// Application invalidates local session
// User logged out across all apps
```

**Files Implementing Logout**:

- `server/routes/keycloak-auth.ts` (logout endpoint)

## HIPAA Compliance

### PHI Protection

**Data Classification**:

- **PHI**: Patient health information (encrypted at rest and in transit)
- **PII**: Personally identifiable information (protected)
- **Public**: Non-sensitive data

**Access Controls**:

- Minimum necessary principle applied
- Role-based access to PHI
- Audit trail for all PHI access
- Automatic session timeout (30 minutes)

### Audit Logging

**Logged Events**:

```typescript
{
  // Authentication Events
  ("AUTH_SUCCESS",
    "AUTH_FAILED",
    "AUTH_ERROR",
    "TOKEN_REFRESHED",
    "TOKEN_REFRESH_FAILED",
    "USER_LOGOUT",
    // Authorization Events
    "AUTHZ_FAILED",
    "MFA_REQUIRED",
    "MFA_VERIFIED",
    // User Management Events
    "USER_CREATED",
    "USER_UPDATED",
    "USER_DISABLED",
    "ROLE_ASSIGNED",
    "ROLE_REMOVED",
    "PASSWORD_RESET",
    // Data Access Events
    "PHI_ACCESSED",
    "PHI_MODIFIED",
    "PHI_EXPORTED");
}
```

**Audit Log Format**:

```json
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "action": "AUTH_SUCCESS",
  "userId": "user-123",
  "resource": "authentication",
  "resourceId": "session-456",
  "details": {
    "email": "user@example.com",
    "roles": ["DOCTOR"],
    "mfaUsed": true
  },
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "success": true
}
```

**Audit Log Retention**:

- Minimum retention: 6 years (HIPAA requirement)
- Immutable: Logs cannot be modified
- Encrypted at rest
- Regular integrity checks
- Automated backup

**Files Implementing Audit Logging**:

- `server/services/auditService.ts`
- `server/middleware/keycloak-auth.ts` (audit log calls)

### Encryption

**Data in Transit**:

- TLS 1.2+ required (TLS 1.3 recommended)
- Strong cipher suites only
- Perfect Forward Secrecy (PFS)
- HSTS headers enforced

**Data at Rest**:

- Database: Transparent Data Encryption (TDE)
- Tokens: Hashed with PBKDF2
- Passwords: PBKDF2 with 27,500 iterations
- PHI: AES-256 encryption

## API Security

### Request Validation

**Input Validation**:

```typescript
// Sanitize all inputs
app.use(sanitizeRequest);

// Validate request schema
app.post("/api/users", validate(userSchema), handler);
```

**Output Encoding**:

- HTML encoding for web output
- JSON encoding for API responses
- Prevent information disclosure in errors

**Files Implementing Validation**:

- `server/middleware/security-enhanced.ts` (sanitizeRequest)
- `server/middleware/validation.ts`

### Rate Limiting

**Rate Limit Tiers**:

```typescript
// General API: 100 requests per 15 minutes per IP
generalRateLimit;

// Authentication: 10 attempts per 15 minutes per IP
authRateLimit;

// Per User: 300 requests per 15 minutes
perUserRateLimit;

// Sensitive Operations: 5 per hour per user
sensitiveOperationRateLimit;
```

**Rate Limit Headers**:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1642251600
Retry-After: 900
```

### CORS Configuration

**Allowed Origins**:

```typescript
[
  "https://telecheck.health",
  "https://app.telecheck.health",
  "https://keycloak.telecheck.health",
];
```

**CORS Headers**:

```
Access-Control-Allow-Origin: https://telecheck.health
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

### Security Headers

**Implemented Headers** (via Helmet.js):

```
Content-Security-Policy: default-src 'self'; script-src 'self'...
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

**Files Implementing Security Headers**:

- `server/middleware/security-enhanced.ts` (securityHeaders)

## Security Monitoring

### Real-Time Monitoring

**Metrics to Monitor**:

- Failed authentication attempts (threshold: 10/minute)
- Token validation failures (threshold: 5/minute)
- MFA bypass attempts (threshold: 1)
- Unauthorized access attempts (threshold: 5/minute)
- Unusual access patterns (time, location, volume)
- Session anomalies (multiple concurrent sessions)

**Alerting Rules**:

```yaml
- name: Multiple Failed Logins
  condition: failed_auth > 5 in 5 minutes
  severity: medium
  action: alert security team

- name: MFA Bypass Attempt
  condition: mfa_required && !mfa_verified
  severity: critical
  action: block request, alert security team

- name: Token Introspection Failure
  condition: introspection_failures > 3 in 1 minute
  severity: high
  action: revoke user session
```

### Security Event Detection

**Suspicious Patterns**:

1. **SQL Injection**:

   ```regex
   /(union|select|insert|update|delete|drop)/i
   ```

2. **XSS Attempts**:

   ```regex
   /(<script|javascript:|onerror=|onload=)/i
   ```

3. **Path Traversal**:

   ```regex
   /(\.\.|\/etc\/|\/proc\/|\/sys\/)/i
   ```

4. **Code Injection**:
   ```regex
   /(eval\(|exec\(|system\()/i
   ```

**Files Implementing Detection**:

- `server/middleware/security-enhanced.ts` (detectSuspiciousActivity)

### Incident Response

**Automated Responses**:

1. **Account Lockout**: After 5 failed attempts
2. **IP Blocking**: After 20 failed attempts in 10 minutes
3. **Session Revocation**: On password reset or suspicious activity
4. **MFA Enforcement**: For compromised accounts
5. **Alert Generation**: Security team notification

**Manual Response Procedures**:

1. Investigate alert in audit logs
2. Identify affected users/sessions
3. Assess scope of potential breach
4. Revoke compromised tokens/sessions
5. Reset affected user credentials
6. Document incident
7. Notify affected parties if PHI exposed (HIPAA requirement)

## Security Checklist

### Pre-Deployment

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Strong password policy configured
- [ ] MFA enforced for all provider roles
- [ ] Rate limiting configured
- [ ] Audit logging enabled
- [ ] Security headers configured
- [ ] CORS properly restricted
- [ ] Token expiration set to 15 minutes or less
- [ ] Refresh token rotation enabled
- [ ] Database encryption enabled
- [ ] Secrets stored securely (not in code)
- [ ] Environment variables properly configured

### Post-Deployment

- [ ] Security monitoring active
- [ ] Alerts configured and tested
- [ ] Incident response plan documented
- [ ] Regular security audits scheduled
- [ ] Penetration testing completed
- [ ] HIPAA compliance verified
- [ ] Audit logs being retained
- [ ] Backup and recovery tested

### Ongoing

- [ ] Weekly review of failed authentication attempts
- [ ] Monthly security audit log review
- [ ] Quarterly penetration testing
- [ ] Annual HIPAA compliance audit
- [ ] Keep Keycloak updated (security patches)
- [ ] Review and update security policies
- [ ] Security awareness training for team

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/)
- [Keycloak Security Guide](https://www.keycloak.org/docs/latest/server_admin/#threat-model-mitigation)
- [OAuth 2.0 Security Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
