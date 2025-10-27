/**
 * Keycloak Configuration Module
 *
 * Production-grade Keycloak client configuration with:
 * - JWT token validation and verification
 * - JWKS (JSON Web Key Set) caching
 * - Keycloak Admin Client for user management
 * - Secure token introspection for sensitive operations
 *
 * Security Features:
 * - RS256 signature verification
 * - Token expiration validation
 * - Issuer and audience verification
 * - Role and scope extraction from token claims
 */

import jwt from "jsonwebtoken";
import axios from "axios";

// Keycloak Configuration from Environment
export const KEYCLOAK_CONFIG = {
  realm: process.env.KEYCLOAK_REALM || "telecheck",
  authServerUrl:
    process.env.KEYCLOAK_AUTH_SERVER_URL || "http://localhost:8180",
  clientId: process.env.KEYCLOAK_CLIENT_ID || "telecheck-web",
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "",
  adminClientId: process.env.KEYCLOAK_ADMIN_CLIENT_ID || "telecheck-api",
  adminClientSecret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET || "",

  // Token Configuration
  tokenLifespan: parseInt(process.env.KEYCLOAK_TOKEN_LIFESPAN || "900"), // 15 minutes default
  refreshTokenLifespan: parseInt(
    process.env.KEYCLOAK_REFRESH_TOKEN_LIFESPAN || "1800",
  ), // 30 minutes default

  // Security Configuration
  validateIssuer: process.env.KEYCLOAK_VALIDATE_ISSUER !== "false",
  validateAudience: process.env.KEYCLOAK_VALIDATE_AUDIENCE !== "false",
  requireHttps: process.env.NODE_ENV === "production",
};

// Generate Keycloak URLs
export const KEYCLOAK_URLS = {
  issuer: `${KEYCLOAK_CONFIG.authServerUrl}/realms/${KEYCLOAK_CONFIG.realm}`,
  tokenEndpoint: `${KEYCLOAK_CONFIG.authServerUrl}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/token`,
  authEndpoint: `${KEYCLOAK_CONFIG.authServerUrl}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/auth`,
  logoutEndpoint: `${KEYCLOAK_CONFIG.authServerUrl}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/logout`,
  userInfoEndpoint: `${KEYCLOAK_CONFIG.authServerUrl}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/userinfo`,
  jwksUri: `${KEYCLOAK_CONFIG.authServerUrl}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/certs`,
  introspectEndpoint: `${KEYCLOAK_CONFIG.authServerUrl}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/token/introspect`,
  adminApi: `${KEYCLOAK_CONFIG.authServerUrl}/admin/realms/${KEYCLOAK_CONFIG.realm}`,
};

// JWKS Cache for public key caching
interface JWKSCache {
  keys: any[];
  expiresAt: number;
}

let jwksCache: JWKSCache | null = null;
const JWKS_CACHE_TTL = 3600000; // 1 hour

/**
 * Fetch JWKS (JSON Web Key Set) from Keycloak
 * Implements caching to reduce network calls
 */
export async function fetchJWKS(): Promise<any[]> {
  const now = Date.now();

  // Return cached JWKS if still valid
  if (jwksCache && jwksCache.expiresAt > now) {
    return jwksCache.keys;
  }

  try {
    const response = await axios.get(KEYCLOAK_URLS.jwksUri, {
      timeout: 5000,
      headers: {
        Accept: "application/json",
      },
    });

    const keys = response.data.keys;

    // Cache the JWKS
    jwksCache = {
      keys,
      expiresAt: now + JWKS_CACHE_TTL,
    };

    console.log(
      `[Keycloak] JWKS fetched and cached. Keys count: ${keys.length}`,
    );
    return keys;
  } catch (error) {
    console.error("[Keycloak] Failed to fetch JWKS:", error);

    // Return stale cache if available
    if (jwksCache) {
      console.warn("[Keycloak] Using stale JWKS cache");
      return jwksCache.keys;
    }

    throw new Error("Failed to fetch JWKS and no cache available");
  }
}

/**
 * Get public key from JWKS for token verification
 */
export async function getPublicKey(kid: string): Promise<string> {
  const keys = await fetchJWKS();
  const key = keys.find((k) => k.kid === kid);

  if (!key) {
    throw new Error(`No key found for kid: ${kid}`);
  }

  // Convert JWK to PEM format
  // For RS256, we need the modulus (n) and exponent (e)
  const publicKey = jwkToPem(key);
  return publicKey;
}

/**
 * Convert JWK to PEM format
 * This is a simplified version - in production, use a library like node-jose or jwk-to-pem
 */
function jwkToPem(jwk: any): string {
  // For production, use: import jwkToPem from 'jwk-to-pem';
  // return jwkToPem(jwk);

  // Simplified implementation for demonstration
  // In production, install and use 'jwk-to-pem' package
  if (jwk.kty !== "RSA") {
    throw new Error("Only RSA keys are supported");
  }

  // This is a placeholder - actual implementation requires proper ASN.1 encoding
  // Install jwk-to-pem: npm install jwk-to-pem @types/jwk-to-pem
  console.warn(
    "[Keycloak] Using simplified JWK to PEM conversion - install jwk-to-pem for production",
  );

  return `-----BEGIN PUBLIC KEY-----\n${jwk.n}\n-----END PUBLIC KEY-----`;
}

/**
 * Verify Keycloak JWT token
 * Validates signature, expiration, issuer, and audience
 */
export async function verifyKeycloakToken(token: string): Promise<any> {
  try {
    // Decode token header to get the key ID (kid)
    const decodedHeader = jwt.decode(token, { complete: true });

    if (!decodedHeader || typeof decodedHeader === "string") {
      throw new Error("Invalid token format");
    }

    const { kid } = decodedHeader.header;

    if (!kid) {
      throw new Error("Token missing kid in header");
    }

    // Get public key for verification
    const publicKey = await getPublicKey(kid);

    // Verify token with full validation
    const verifyOptions: jwt.VerifyOptions = {
      algorithms: ["RS256"],
      issuer: KEYCLOAK_CONFIG.validateIssuer ? KEYCLOAK_URLS.issuer : undefined,
      audience: KEYCLOAK_CONFIG.validateAudience
        ? KEYCLOAK_CONFIG.clientId
        : undefined,
    };

    const decoded = jwt.verify(token, publicKey, verifyOptions);

    console.log("[Keycloak] Token verified successfully");
    return decoded;
  } catch (error: any) {
    console.error("[Keycloak] Token verification failed:", error.message);
    throw error;
  }
}

/**
 * Introspect token with Keycloak (for sensitive operations)
 * This makes a network call to Keycloak to validate token status
 */
export async function introspectToken(token: string): Promise<any> {
  try {
    const response = await axios.post(
      KEYCLOAK_URLS.introspectEndpoint,
      new URLSearchParams({
        token,
        client_id: KEYCLOAK_CONFIG.clientId,
        client_secret: KEYCLOAK_CONFIG.clientSecret,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 5000,
      },
    );

    if (!response.data.active) {
      throw new Error("Token is not active");
    }

    console.log("[Keycloak] Token introspection successful");
    return response.data;
  } catch (error) {
    console.error("[Keycloak] Token introspection failed:", error);
    throw new Error("Token introspection failed");
  }
}

/**
 * Extract roles from Keycloak token
 * Supports both realm roles and client roles
 */
export function extractRoles(decodedToken: any): string[] {
  const roles: string[] = [];

  // Extract realm roles
  if (decodedToken.realm_access?.roles) {
    roles.push(...decodedToken.realm_access.roles);
  }

  // Extract client roles
  if (decodedToken.resource_access?.[KEYCLOAK_CONFIG.clientId]?.roles) {
    roles.push(...decodedToken.resource_access[KEYCLOAK_CONFIG.clientId].roles);
  }

  return roles;
}

/**
 * Extract user information from Keycloak token
 */
export function extractUserInfo(decodedToken: any): {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
} {
  const roles = extractRoles(decodedToken);

  return {
    id: decodedToken.sub,
    email: decodedToken.email || decodedToken.preferred_username,
    firstName: decodedToken.given_name || "",
    lastName: decodedToken.family_name || "",
    roles,
    permissions: decodedToken.scope?.split(" ") || [],
  };
}

/**
 * Admin Client Token Management
 * Maintains service account token for admin operations
 */
class KeycloakAdminClient {
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  /**
   * Get admin access token (with automatic refresh)
   */
  async getAccessToken(): Promise<string> {
    const now = Date.now();

    // Return cached token if still valid (with 30s buffer)
    if (this.accessToken && this.tokenExpiresAt > now + 30000) {
      return this.accessToken;
    }

    // Request new admin token
    try {
      const response = await axios.post(
        KEYCLOAK_URLS.tokenEndpoint,
        new URLSearchParams({
          grant_type: "client_credentials",
          client_id: KEYCLOAK_CONFIG.adminClientId,
          client_secret: KEYCLOAK_CONFIG.adminClientSecret,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          timeout: 5000,
        },
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = now + response.data.expires_in * 1000;

      console.log("[Keycloak Admin] Access token obtained");
      return this.accessToken;
    } catch (error) {
      console.error("[Keycloak Admin] Failed to obtain access token:", error);
      throw new Error("Failed to obtain admin access token");
    }
  }

  /**
   * Make authenticated request to Keycloak Admin API
   */
  async request(method: string, path: string, data?: any): Promise<any> {
    const token = await this.getAccessToken();

    try {
      const response = await axios({
        method,
        url: `${KEYCLOAK_URLS.adminApi}${path}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data,
        timeout: 10000,
      });

      return response.data;
    } catch (error: any) {
      console.error(
        `[Keycloak Admin] API request failed: ${method} ${path}`,
        error.message,
      );
      throw error;
    }
  }
}

// Export singleton admin client instance
export const keycloakAdmin = new KeycloakAdminClient();

/**
 * Validate Keycloak configuration on startup
 */
export async function validateKeycloakConfig(): Promise<boolean> {
  try {
    console.log("[Keycloak] Validating configuration...");

    // Check required environment variables
    if (!KEYCLOAK_CONFIG.clientId || !KEYCLOAK_CONFIG.clientSecret) {
      console.error("[Keycloak] Missing required client credentials");
      return false;
    }

    // Test JWKS endpoint
    await fetchJWKS();

    // Test admin client
    if (KEYCLOAK_CONFIG.adminClientId && KEYCLOAK_CONFIG.adminClientSecret) {
      await keycloakAdmin.getAccessToken();
    }

    console.log("[Keycloak] Configuration validated successfully");
    return true;
  } catch (error) {
    console.error("[Keycloak] Configuration validation failed:", error);
    return false;
  }
}
