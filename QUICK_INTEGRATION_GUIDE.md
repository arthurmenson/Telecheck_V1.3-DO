# Quick Integration Guide - Keycloak Authentication

This guide provides step-by-step instructions to integrate the Keycloak authentication system into your existing TeleCheck application.

## Step 1: Update Server Entry Point (5 minutes)

Edit `C:\Users\menso\Downloads\Telecheck_V1.3-DO\server\index.ts`:

```typescript
// Add imports at the top
import keycloakAuthRoutes from "./routes/keycloak-auth";
import {
  securityHeaders,
  corsConfig,
  generalRateLimit,
  sanitizeRequest,
  detectSuspiciousActivity,
} from "./middleware/security-enhanced";
import { validateKeycloakConfig } from "./config/keycloak";

// After creating Express app, before other middleware
app.use(securityHeaders);
app.use(cors(corsConfig()));
app.use(generalRateLimit);
app.use(sanitizeRequest);
app.use(detectSuspiciousActivity);

// Mount Keycloak auth routes (add with other routes)
app.use("/api/auth/keycloak", keycloakAuthRoutes);

// In your startup function, validate Keycloak
async function startServer() {
  // ... existing startup code

  // Validate Keycloak configuration
  const keycloakValid = await validateKeycloakConfig();
  if (!keycloakValid) {
    console.error("⚠️  Keycloak configuration validation failed");
    console.warn(
      "Application will start but Keycloak authentication will not work",
    );
    // Don't exit - allow fallback to existing auth
  } else {
    console.log("✅ Keycloak configuration validated");
  }

  // ... rest of startup code
}
```

## Step 2: Protect Existing Routes (10 minutes)

Update existing routes to use Keycloak authentication:

**Option A: Replace existing auth middleware**

```typescript
// Before:
import { authenticateToken, requireRole } from "./middleware/auth";

// After:
import {
  authenticateKeycloak,
  requireRole,
  requireDoctor,
  requireAdmin,
} from "./middleware/keycloak-auth";

// Update route protection:
// Before:
app.get("/api/patients", authenticateToken, requireRole(["doctor"]), handler);

// After:
app.get("/api/patients", authenticateKeycloak, requireDoctor, handler);
```

**Option B: Support both auth methods (recommended during migration)**

```typescript
import { authenticateToken } from "./middleware/auth";
import { authenticateKeycloak } from "./middleware/keycloak-auth";

// Middleware that tries Keycloak first, falls back to JWT
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if it's a Keycloak token (longer, starts with ey...)
  if (authHeader && authHeader.startsWith("Bearer eyJ")) {
    try {
      await authenticateKeycloak(req, res, () => {
        if (req.user) {
          next();
        } else {
          authenticateToken(req, res, next);
        }
      });
    } catch (error) {
      authenticateToken(req, res, next);
    }
  } else {
    authenticateToken(req, res, next);
  }
};

// Use combined middleware
app.get("/api/patients", authenticate, requireDoctor, handler);
```

## Step 3: Update Frontend Login Page (15 minutes)

Edit `C:\Users\menso\Downloads\Telecheck_V1.3-DO\client\pages\Login.tsx`:

```typescript
// Add state for Keycloak auth
const [isKeycloakEnabled, setIsKeycloakEnabled] = useState(false);

// Check if Keycloak is enabled
useEffect(() => {
  fetch("/api/auth/providers")
    .then((res) => res.json())
    .then((data) => {
      if (data.keycloak?.enabled) {
        setIsKeycloakEnabled(true);
      }
    });
}, []);

// Add Keycloak login handler
const handleKeycloakLogin = async () => {
  try {
    const response = await fetch("/api/auth/keycloak/login");
    const { authUrl, state } = await response.json();

    // Store state for validation on callback
    sessionStorage.setItem("keycloak_state", state);

    // Redirect to Keycloak
    window.location.href = authUrl;
  } catch (error) {
    toast({
      title: "Login Error",
      description: "Failed to initiate Keycloak login",
      variant: "destructive",
    });
  }
};

// Add Keycloak button in the form (after existing login button)
{isKeycloakEnabled && (
  <>
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">
          Or continue with
        </span>
      </div>
    </div>

    <Button
      type="button"
      variant="outline"
      onClick={handleKeycloakLogin}
      className="w-full"
    >
      <KeyRound className="w-4 h-4 mr-2" />
      Sign in with Keycloak SSO
    </Button>
  </>
)}
```

## Step 4: Create OAuth Callback Handler (10 minutes)

Create `C:\Users\menso\Downloads\Telecheck_V1.3-DO\client\pages\AuthCallback.tsx`:

```typescript
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "../hooks/use-toast";

export function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get("code");
      const state = params.get("state");
      const error = params.get("error");

      // Handle error
      if (error) {
        toast({
          title: "Authentication Failed",
          description: `Error: ${error}`,
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      // Validate state
      const storedState = sessionStorage.getItem("keycloak_state");
      if (state !== storedState) {
        toast({
          title: "Authentication Failed",
          description: "Invalid state parameter",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      try {
        // Exchange code for tokens
        const response = await fetch("/api/auth/keycloak/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code, state }),
        });

        if (!response.ok) {
          throw new Error("Token exchange failed");
        }

        const data = await response.json();

        // Store tokens in httpOnly cookies (handled by server)
        // Or store in secure cookie if server returns them

        toast({
          title: "Login Successful",
          description: `Welcome, ${data.user.firstName}!`,
        });

        // Redirect based on role
        const roleRedirects = {
          PATIENT: "/dashboard",
          DOCTOR: "/doctor-dashboard",
          NURSE: "/nurse-dashboard",
          ADMIN: "/admin-dashboard",
          PHARMACIST: "/pharmacist-dashboard",
          CAREGIVER: "/caregiver-dashboard",
        };

        const redirectPath =
          roleRedirects[data.user.roles[0]] || "/dashboard";
        navigate(redirectPath, { replace: true });
      } catch (error) {
        toast({
          title: "Authentication Failed",
          description: "Failed to complete login",
          variant: "destructive",
        });
        navigate("/login");
      }
    };

    handleCallback();
  }, [location, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}
```

Add route in your router configuration:

```typescript
import { AuthCallback } from "./pages/AuthCallback";

// Add to routes
<Route path="/auth/callback" element={<AuthCallback />} />
```

## Step 5: Set Up Keycloak Server (30 minutes)

### Development Setup:

```bash
# 1. Start Keycloak with Docker
docker run -d \
  --name keycloak-dev \
  -p 8180:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:23.0 \
  start-dev

# 2. Wait for Keycloak to start (about 1 minute)
echo "Waiting for Keycloak to start..."
sleep 60

# 3. Configure Keycloak realm
chmod +x scripts/configure-keycloak.sh
KEYCLOAK_URL=http://localhost:8180 \
KEYCLOAK_ADMIN=admin \
KEYCLOAK_ADMIN_PASSWORD=admin \
./scripts/configure-keycloak.sh

# 4. Save the client secrets displayed!
```

### Update .env file:

```bash
# Copy secrets from configure-keycloak.sh output
KEYCLOAK_CLIENT_SECRET=<web-client-secret>
KEYCLOAK_ADMIN_CLIENT_SECRET=<api-client-secret>
```

## Step 6: Database Migration (Optional, 5 minutes)

If you want to link Keycloak users to local users:

```prisma
// In prisma/schema.prisma, add to User model:
model User {
  // ... existing fields
  keycloakId String? @unique @map("keycloak_id")
  // ... rest of model
}
```

Run migration:

```bash
npx prisma migrate dev --name add_keycloak_id
npx prisma generate
```

## Step 7: Test the Integration (15 minutes)

### Test 1: Keycloak Login Flow

```bash
# 1. Start your application
npm run dev

# 2. Navigate to http://localhost:8080/login

# 3. Click "Sign in with Keycloak SSO"

# 4. Login with test credentials:
# Email: test.patient@example.com
# Password: TestPatient123!

# 5. Verify redirect to dashboard
```

### Test 2: Protected API Endpoints

```bash
# Get access token from login
TOKEN="<access-token-from-login>"

# Test protected endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/auth/keycloak/user

# Should return user information
```

### Test 3: MFA Flow (for providers)

```bash
# 1. Login as doctor:
# Email: test.provider@example.com
# Password: TestProvider123!

# 2. Follow MFA setup instructions

# 3. Scan QR code with Google Authenticator

# 4. Enter 6-digit code

# 5. Verify successful authentication
```

## Step 8: Verify Security (10 minutes)

### Check Security Headers

```bash
# Test security headers
curl -I http://localhost:8080

# Should include:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Strict-Transport-Security: max-age=31536000
# X-XSS-Protection: 1; mode=block
```

### Check Rate Limiting

```bash
# Make 15 rapid requests
for i in {1..15}; do
  curl http://localhost:8080/api/auth/keycloak/login
done

# 11th request should be rate limited
```

### Check CORS

```bash
# Test CORS from unauthorized origin
curl -H "Origin: http://evil.com" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS \
  http://localhost:8080/api/auth/keycloak/callback

# Should be rejected
```

## Troubleshooting

### Issue: "Failed to fetch JWKS"

**Solution**:

```bash
# Verify Keycloak is running
curl http://localhost:8180/realms/telecheck

# Check KEYCLOAK_AUTH_SERVER_URL in .env
# Should be: http://localhost:8180 (no /auth suffix for Keycloak 17+)
```

### Issue: "Token verification failed"

**Solution**:

```bash
# Check client ID matches
echo $KEYCLOAK_CLIENT_ID  # Should be: telecheck-web

# Verify realm is configured
curl http://localhost:8180/realms/telecheck/.well-known/openid-configuration
```

### Issue: "CORS error"

**Solution**:

```typescript
// In server/middleware/security-enhanced.ts
// Add your frontend URL to allowedOrigins
const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:5173", // Add Vite dev server
  // ... others
];
```

## Next Steps

1. **Read Documentation**:
   - [KEYCLOAK_SETUP.md](./docs/KEYCLOAK_SETUP.md) - Full setup guide
   - [KEYCLOAK_SECURITY.md](./docs/KEYCLOAK_SECURITY.md) - Security guide
   - [KEYCLOAK_IMPLEMENTATION_SUMMARY.md](./KEYCLOAK_IMPLEMENTATION_SUMMARY.md) - Implementation details

2. **Customize**:
   - Adjust token lifespans in .env
   - Configure rate limits for your use case
   - Add custom roles if needed
   - Customize MFA requirements

3. **Production Deployment**:
   - Deploy Keycloak to production
   - Configure SSL/TLS
   - Set up monitoring
   - Enable audit logging

4. **User Migration**:
   - Create migration script for existing users
   - Test migration with sample users
   - Plan cutover timeline

## Quick Reference

**Keycloak Admin Console**: http://localhost:8180/admin

- Username: admin
- Password: admin

**Test Users**:

- Patient: test.patient@example.com / TestPatient123!
- Doctor: test.provider@example.com / TestProvider123! (MFA required)
- Admin: test.admin@example.com / TestAdmin123! (MFA required)

**Key Endpoints**:

- Login: GET /api/auth/keycloak/login
- Callback: POST /api/auth/keycloak/callback
- Refresh: POST /api/auth/keycloak/refresh
- Logout: POST /api/auth/keycloak/logout
- User Info: GET /api/auth/keycloak/user
- Session: GET /api/auth/keycloak/session

**Environment Variables**:

```bash
KEYCLOAK_REALM=telecheck
KEYCLOAK_AUTH_SERVER_URL=http://localhost:8180
KEYCLOAK_CLIENT_ID=telecheck-web
KEYCLOAK_CLIENT_SECRET=<from-setup-script>
KEYCLOAK_ADMIN_CLIENT_ID=telecheck-api
KEYCLOAK_ADMIN_CLIENT_SECRET=<from-setup-script>
```

---

**Total Integration Time**: ~90 minutes

**Questions?** Refer to:

- [KEYCLOAK_IMPLEMENTATION_SUMMARY.md](./KEYCLOAK_IMPLEMENTATION_SUMMARY.md)
- [docs/KEYCLOAK_SETUP.md](./docs/KEYCLOAK_SETUP.md)
- [docs/KEYCLOAK_SECURITY.md](./docs/KEYCLOAK_SECURITY.md)
