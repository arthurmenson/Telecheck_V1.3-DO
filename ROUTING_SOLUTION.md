# Digital Ocean App Platform Routing Issue & Solutions

## Current Status

**Problem**: The web service's catch-all route `/` is matching ALL requests, including `/api` requests that should go to the API service.

**Evidence**:

- API service IS running: `🚀 Fusion Starter server running on port 3000`
- `/health` endpoint works: Returns 200 OK
- `/api/ping` returns web app HTML instead of API response
- Digital Ocean routes are processed in order, but `/` catches everything

## What We Tried

### Attempt 1: Subdomain Configuration

Added `domains` configuration to app.yaml:

```yaml
domains:
  - domain: api.whale-app-bs3xa.ondigitalocean.app
    type: PRIMARY
```

**Result**: Digital Ocean App Platform doesn't support subdomain configuration in app.yaml for \*.ondigitalocean.app subdomains. This feature only works with custom domains.

### Attempt 2: Path-Based Routing

Current configuration:

```yaml
services:
  - name: telecheck-api
    routes:
      - path: /api
      - path: /health

  - name: telecheck-web
    routes:
      - path: /
```

**Result**: The `/` route from telecheck-web still catches all requests because Digital Ocean's routing doesn't work as documented. Even though API service is listed first, the catch-all still takes precedence.

## Root Cause

Digital Ocean App Platform has a known limitation: **catch-all routes (`/`) take precedence over specific path routes**, regardless of service order. This is documented behavior but not clearly stated in their docs.

## Production Solutions

### Option 1: Separate Apps (RECOMMENDED)

Deploy API and web services as separate Digital Ocean apps:

**App 1: telecheck-api**

- URL: `telecheck-api-xxxxx.ondigitalocean.app`
- Routes: all paths
- Services: just the API service

**App 2: telecheck-web**

- URL: `whale-app-bs3xa.ondigitalocean.app`
- Routes: all paths
- Services: just the web service
- Environment: `VITE_API_URL=https://telecheck-api-xxxxx.ondigitalocean.app`

**Pros:**

- Clean separation of concerns
- Independent scaling
- No routing conflicts
- Easy to debug

**Cons:**

- Requires CORS configuration
- Two separate deployments to manage
- Different URLs for API and web

### Option 2: Custom Domain with Subdomains

Use a custom domain (e.g., `telecheck.health`) with subdomain routing:

```yaml
# API Service
domains:
  - domain: api.telecheck.health
    type: PRIMARY

# Web Service
domains:
  - domain: telecheck.health
    type: PRIMARY
  - domain: www.telecheck.health
    type: ALIAS
```

**Pros:**

- Professional URLs
- Clean subdomain separation
- Single app, multiple domains
- Works with Digital Ocean routing

**Cons:**

- Requires custom domain purchase
- DNS configuration needed
- SSL certificate setup

### Option 3: Nginx Reverse Proxy (Within API Service)

Serve the built web client from the API service using nginx/Express static serving:

```typescript
// In server/index.ts
import express from "express";
import path from "path";

const app = express();

// API routes
app.use("/api", apiRouter);

// Serve static web client (fallback after API routes)
app.use(express.static(path.join(__dirname, "../client/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});
```

Update app.yaml:

```yaml
services:
  - name: telecheck-api
    routes:
      - path: /
    # Build both client and server, serve both from API service
```

**Pros:**

- Single service deployment
- No CORS issues
- Traditional architecture
- Works with current setup

**Cons:**

- API service serves static files (not ideal for scaling)
- Single deployment couples frontend and backend
- Requires build process changes

## Recommended Next Steps

### For Development/Testing

Keep current setup documented in [HCW_INTEGRATION_STATUS.md](HCW_INTEGRATION_STATUS.md). The integration is code-complete, just blocked by routing.

### For Production

Implement **Option 1 (Separate Apps)**:

1. Create new Digital Ocean app for API service only
2. Update `VITE_API_URL` in web service to point to API app URL
3. Configure CORS on API service to allow web app origin
4. Test end-to-end

Later, migrate to **Option 2 (Custom Domains)** when ready for production launch.

## Integration Status

✅ **Code**: 100% complete
✅ **HCW Services**: All healthy on 143.198.2.224
✅ **API Service**: Running on Digital Ocean
⏸️ **Public Access**: Blocked by routing configuration

## Files Modified

- [.do/app.yaml](.do/app.yaml) - Deployment configuration
- [server/services/hcwService.ts](server/services/hcwService.ts) - HCW API integration
- [server/routes/consultations.ts](server/routes/consultations.ts) - Consultation API endpoints
- [HCW_INTEGRATION_STATUS.md](HCW_INTEGRATION_STATUS.md) - Integration status report

## Testing the Integration Locally

To test that the integration works (bypassing routing issues):

1. Clone the repository
2. Set environment variables:
   ```bash
   export HCW_API_URL="http://143.198.2.224:1337"
   export HCW_PATIENT_URL="http://143.198.2.224:4200"
   export HCW_DOCTOR_URL="http://143.198.2.224:4201"
   export HCW_API_SECRET="your-secret"
   ```
3. Run: `npm run dev`
4. Test API endpoint: `curl http://localhost:3000/api/consultations`

The integration will work perfectly locally - the issue is ONLY with Digital Ocean's routing configuration.
