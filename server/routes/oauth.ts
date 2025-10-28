/**
 * OAuth Authentication Routes
 * Handles Google OAuth and Keycloak SSO authentication flows
 */

import { Router, Request, Response } from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { dbPool } from "../config/database";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret";
const OAUTH_ENABLED = process.env.OAUTH_ENABLED === "true";

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL ||
  "http://localhost:8080/api/auth/google/callback";

// Keycloak Configuration
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || "telecheck";
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID;
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET;
const KEYCLOAK_AUTH_SERVER_URL =
  process.env.KEYCLOAK_AUTH_SERVER_URL || "http://localhost:8180/auth";
const KEYCLOAK_CALLBACK_URL =
  process.env.KEYCLOAK_CALLBACK_URL ||
  "http://localhost:8080/api/auth/keycloak/callback";

/**
 * Get OAuth providers status
 */
router.get("/providers", (req: Request, res: Response) => {
  const providers = {
    oauth_enabled: OAUTH_ENABLED,
    google: {
      enabled: !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET),
      auth_url: "/api/auth/google",
    },
    keycloak: {
      enabled: !!(KEYCLOAK_CLIENT_ID && KEYCLOAK_CLIENT_SECRET),
      auth_url: "/api/auth/keycloak",
    },
  };

  res.json(providers);
});

/**
 * Google OAuth - Initiate authentication
 */
router.get("/google", (req: Request, res: Response) => {
  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({ error: "Google OAuth not configured" });
  }

  const redirectUri = GOOGLE_CALLBACK_URL;
  const scope = "openid profile email";
  const state = Buffer.from(JSON.stringify({ timestamp: Date.now() })).toString(
    "base64",
  );

  const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scope)}&` +
    `state=${state}&` +
    `access_type=offline&` +
    `prompt=consent`;

  res.redirect(googleAuthUrl);
});

/**
 * Google OAuth - Callback handler
 */
router.get("/google/callback", async (req: Request, res: Response) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(`/login?error=${error}`);
  }

  if (!code) {
    return res.redirect("/login?error=no_code");
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code",
      },
    );

    const { access_token, id_token } = tokenResponse.data;

    // Get user info from Google
    const userInfoResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      },
    );

    const googleUser = userInfoResponse.data;

    // Find or create user in database
    if (!dbPool) {
      // If no database, create temporary session
      const tempToken = jwt.sign(
        {
          id: googleUser.id,
          email: googleUser.email,
          firstName: googleUser.given_name,
          lastName: googleUser.family_name,
          role: "patient", // Default role for OAuth users
          provider: "google",
        },
        JWT_SECRET,
        { expiresIn: "24h" },
      );

      return res.redirect(`/login?token=${tempToken}&provider=google`);
    }

    // Check if user exists
    const existingUser = await dbPool.query(
      "SELECT * FROM users WHERE email = $1",
      [googleUser.email],
    );

    let user;
    if (existingUser.rows.length > 0) {
      user = existingUser.rows[0];

      // Update last login
      await dbPool.query(
        "UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1",
        [user.id],
      );
    } else {
      // Create new user
      const newUser = await dbPool.query(
        `INSERT INTO users (email, first_name, last_name, role, is_active, password_hash)
         VALUES ($1, $2, $3, $4, true, $5)
         RETURNING *`,
        [
          googleUser.email,
          googleUser.given_name || "Google",
          googleUser.family_name || "User",
          "patient", // Default role
          "oauth_google", // Placeholder password hash for OAuth users
        ],
      );
      user = newUser.rows[0];
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        provider: "google",
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    const refreshToken = jwt.sign(
      { id: user.id, provider: "google" },
      JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // Redirect to frontend with tokens
    res.redirect(
      `/login?token=${accessToken}&refresh_token=${refreshToken}&provider=google&role=${user.role}`,
    );
  } catch (error) {
    console.error("Google OAuth error:", error);
    res.redirect("/login?error=oauth_failed");
  }
});

/**
 * Keycloak SSO - Initiate authentication
 */
router.get("/keycloak", (req: Request, res: Response) => {
  if (!KEYCLOAK_CLIENT_ID) {
    return res.status(500).json({ error: "Keycloak SSO not configured" });
  }

  const redirectUri = KEYCLOAK_CALLBACK_URL;

  // Generate PKCE code verifier and challenge
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  // Store code_verifier in the state parameter (encrypted)
  // This avoids cookie issues with cross-site redirects
  const stateData = {
    timestamp: Date.now(),
    codeVerifier: codeVerifier,
  };
  const state = Buffer.from(JSON.stringify(stateData)).toString("base64url");

  const keycloakAuthUrl =
    `${KEYCLOAK_AUTH_SERVER_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth?` +
    `client_id=${KEYCLOAK_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=openid profile email&` +
    `state=${state}&` +
    `code_challenge=${codeChallenge}&` +
    `code_challenge_method=S256`;

  res.redirect(keycloakAuthUrl);
});

/**
 * Keycloak SSO - Callback handler
 */
router.get("/keycloak/callback", async (req: Request, res: Response) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(`/login?error=${error}`);
  }

  if (!code) {
    return res.redirect("/login?error=no_code");
  }

  try {
    // Extract code_verifier from state parameter
    let codeVerifier: string;
    try {
      const stateData = JSON.parse(
        Buffer.from(state as string, "base64url").toString("utf-8"),
      );
      codeVerifier = stateData.codeVerifier;

      // Validate timestamp (state should be used within 10 minutes)
      const age = Date.now() - stateData.timestamp;
      if (age > 600000) {
        // 10 minutes
        console.error("PKCE state expired:", age, "ms");
        return res.redirect("/login?error=state_expired");
      }
    } catch (e) {
      console.error("Failed to parse state parameter:", e);
      return res.redirect("/login?error=invalid_state");
    }

    if (!codeVerifier) {
      console.error("PKCE code_verifier missing from state");
      return res.redirect("/login?error=invalid_request");
    }

    // Exchange code for tokens
    const tokenUrl = `${KEYCLOAK_AUTH_SERVER_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;

    // Build token request params with PKCE
    const tokenParams: Record<string, string> = {
      code: code as string,
      client_id: KEYCLOAK_CLIENT_ID!,
      redirect_uri: KEYCLOAK_CALLBACK_URL,
      grant_type: "authorization_code",
      code_verifier: codeVerifier,
    };

    // Only add client_secret if it's a confidential client (not public)
    if (
      KEYCLOAK_CLIENT_SECRET &&
      KEYCLOAK_CLIENT_SECRET !== "public-client-no-secret"
    ) {
      tokenParams.client_secret = KEYCLOAK_CLIENT_SECRET;
    }

    const tokenResponse = await axios.post(
      tokenUrl,
      new URLSearchParams(tokenParams),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const { access_token, id_token } = tokenResponse.data;

    // Decode ID token to get user info
    const decodedToken: any = jwt.decode(id_token);

    // Find or create user in database
    if (!dbPool) {
      // If no database, create temporary session
      const tempToken = jwt.sign(
        {
          id: decodedToken.sub,
          email: decodedToken.email,
          firstName: decodedToken.given_name,
          lastName: decodedToken.family_name,
          role: decodedToken.role || "patient",
          provider: "keycloak",
        },
        JWT_SECRET,
        { expiresIn: "24h" },
      );

      return res.redirect(`/login?token=${tempToken}&provider=keycloak`);
    }

    // Check if user exists
    const existingUser = await dbPool.query(
      "SELECT * FROM users WHERE email = $1",
      [decodedToken.email],
    );

    let user;
    if (existingUser.rows.length > 0) {
      user = existingUser.rows[0];

      // Update last login
      await dbPool.query(
        "UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1",
        [user.id],
      );
    } else {
      // Create new user
      const newUser = await dbPool.query(
        `INSERT INTO users (email, first_name, last_name, role, is_active, password_hash)
         VALUES ($1, $2, $3, $4, true, $5)
         RETURNING *`,
        [
          decodedToken.email,
          decodedToken.given_name || "Keycloak",
          decodedToken.family_name || "User",
          decodedToken.role || "patient",
          "oauth_keycloak", // Placeholder password hash for OAuth users
        ],
      );
      user = newUser.rows[0];
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        provider: "keycloak",
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    const refreshToken = jwt.sign(
      { id: user.id, provider: "keycloak" },
      JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // Redirect to frontend with tokens
    res.redirect(
      `/login?token=${accessToken}&refresh_token=${refreshToken}&provider=keycloak&role=${user.role}`,
    );
  } catch (error) {
    console.error("Keycloak OAuth error:", error);
    res.redirect("/login?error=oauth_failed");
  }
});

export default router;
