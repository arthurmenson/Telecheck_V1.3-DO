/**
 * Keycloak Integration for Telecheck Frontend
 *
 * This module provides Keycloak authentication using the official keycloak-js adapter.
 * It handles initialization, login, logout, token refresh, and role-based access control.
 */

import Keycloak from "keycloak-js";

// Keycloak configuration
const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8180",
  realm: import.meta.env.VITE_KEYCLOAK_REALM || "telecheck",
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "telecheck-web",
};

// Initialize Keycloak instance
const keycloak = new Keycloak(keycloakConfig);

// Keycloak initialization options
const initOptions = {
  onLoad: "check-sso" as const, // Check if user is already logged in
  checkLoginIframe: false, // Disable iframe check for better performance
  pkceMethod: "S256" as const, // Use PKCE for security
  enableLogging: import.meta.env.DEV, // Enable logging in development
};

/**
 * Initialize Keycloak
 * Must be called before rendering the app
 */
export async function initKeycloak(): Promise<boolean> {
  try {
    const authenticated = await keycloak.init(initOptions);
    console.log(`Keycloak initialized. Authenticated: ${authenticated}`);

    // Set up automatic token refresh
    if (authenticated) {
      setupTokenRefresh();
    }

    return authenticated;
  } catch (error) {
    console.error("Failed to initialize Keycloak:", error);
    return false;
  }
}

/**
 * Set up automatic token refresh
 * Refreshes the token 30 seconds before it expires
 */
function setupTokenRefresh() {
  // Update tokens every 5 minutes
  setInterval(() => {
    keycloak
      .updateToken(30) // Refresh if token expires in 30 seconds
      .then((refreshed) => {
        if (refreshed) {
          console.log("Token refreshed successfully");
        }
      })
      .catch((error) => {
        console.error("Failed to refresh token:", error);
        // Redirect to login if token refresh fails
        keycloak.login();
      });
  }, 30000); // Check every 30 seconds
}

/**
 * Login with Keycloak
 */
export function login(redirectUri?: string) {
  keycloak.login({
    redirectUri: redirectUri || window.location.origin,
  });
}

/**
 * Logout from Keycloak
 */
export function logout(redirectUri?: string) {
  keycloak.logout({
    redirectUri: redirectUri || window.location.origin,
  });
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return keycloak.authenticated || false;
}

/**
 * Get current user's token
 */
export function getToken(): string | undefined {
  return keycloak.token;
}

/**
 * Get user profile information
 */
export async function getUserProfile() {
  try {
    return await keycloak.loadUserProfile();
  } catch (error) {
    console.error("Failed to load user profile:", error);
    return null;
  }
}

/**
 * Get user roles from token
 */
export function getUserRoles(): string[] {
  if (!keycloak.tokenParsed) return [];

  const realmRoles = keycloak.tokenParsed.realm_access?.roles || [];
  const clientRoles =
    keycloak.tokenParsed.resource_access?.[keycloakConfig.clientId]?.roles ||
    [];

  return [...realmRoles, ...clientRoles];
}

/**
 * Check if user has a specific role
 */
export function hasRole(role: string): boolean {
  return keycloak.hasRealmRole(role) || keycloak.hasResourceRole(role);
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(roles: string[]): boolean {
  return roles.some((role) => hasRole(role));
}

/**
 * Check if user has all of the specified roles
 */
export function hasAllRoles(roles: string[]): boolean {
  return roles.every((role) => hasRole(role));
}

/**
 * Get user information from token
 */
export function getUserInfo() {
  if (!keycloak.tokenParsed) return null;

  return {
    id: keycloak.tokenParsed.sub,
    email: keycloak.tokenParsed.email,
    firstName: keycloak.tokenParsed.given_name,
    lastName: keycloak.tokenParsed.family_name,
    name: keycloak.tokenParsed.name,
    username: keycloak.tokenParsed.preferred_username,
    roles: getUserRoles(),
    emailVerified: keycloak.tokenParsed.email_verified,
  };
}

/**
 * Update token and return the latest one
 * Useful for API requests
 */
export async function getUpdatedToken(): Promise<string | undefined> {
  try {
    await keycloak.updateToken(30);
    return keycloak.token;
  } catch (error) {
    console.error("Failed to update token:", error);
    return undefined;
  }
}

/**
 * Account management - redirect to Keycloak account page
 */
export function manageAccount() {
  keycloak.accountManagement();
}

/**
 * Register a new user
 */
export function register(redirectUri?: string) {
  keycloak.register({
    redirectUri: redirectUri || window.location.origin,
  });
}

/**
 * Get authorization header for API requests
 */
export function getAuthorizationHeader(): { Authorization: string } | {} {
  const token = keycloak.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default keycloak;
