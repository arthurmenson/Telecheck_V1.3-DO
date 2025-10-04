import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { type FullConfig, type StorageState } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_DIR = path.resolve(__dirname, "../.auth");
const LOGGED_IN_STATE_PATH = path.join(AUTH_DIR, "state.json");
const LOGGED_OUT_STATE_PATH = path.join(AUTH_DIR, "state.logged-out.json");
const PATIENT_STATE_PATH = path.join(AUTH_DIR, "state.patient.json");

export type PlaywrightRole = "patient" | "doctor" | "nurse" | "admin";

interface MockUser {
  id: string;
  email: string;
  name: string;
  role: PlaywrightRole;
  permissions: string[];
  isActive: boolean;
}

const ROLE_MOCKS: Record<PlaywrightRole, MockUser> = {
  doctor: {
    id: "2",
    email: "doctor@telecheck.com",
    name: "Dr. Sarah Wilson",
    role: "doctor",
    permissions: [
      "view_all_patients",
      "prescribe_medications",
      "review_labs",
      "telehealth_consults",
      "approve_treatments",
    ],
    isActive: true,
  },
  patient: {
    id: "1",
    email: "patient@telecheck.com",
    name: "John Patient",
    role: "patient",
    permissions: [
      "view_own_records",
      "book_appointments",
      "order_medications",
      "view_lab_results",
    ],
    isActive: true,
  },
  nurse: {
    id: "4",
    email: "nurse@telecheck.com",
    name: "Nurse Jennifer Smith",
    role: "nurse",
    permissions: [
      "view_all_patients",
      "patient_assessment",
      "vital_monitoring",
      "care_coordination",
    ],
    isActive: true,
  },
  admin: {
    id: "5",
    email: "admin@telecheck.com",
    name: "Avery Admin",
    role: "admin",
    permissions: ["full_access"],
    isActive: true,
  },
};

function buildToken(user: MockUser) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    exp: Date.now() + 24 * 60 * 60 * 1000,
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

async function ensureAuthDir() {
  await fs.mkdir(AUTH_DIR, { recursive: true });
}

async function writeState(targetPath: string, state: StorageState) {
  await ensureAuthDir();
  await fs.writeFile(targetPath, JSON.stringify(state, null, 2), "utf-8");
}

const ROLE_PERMISSIONS: Record<PlaywrightRole, string[]> = {
  doctor: [
    "view_all_patients",
    "prescribe_medications",
    "review_labs",
    "telehealth_consults",
    "approve_treatments",
  ],
  patient: [
    "view_own_records",
    "book_appointments",
    "order_medications",
    "view_lab_results",
  ],
  nurse: [
    "view_all_patients",
    "patient_assessment",
    "vital_monitoring",
    "care_coordination",
  ],
  admin: ["full_access"],
};

const DEFAULT_CREDENTIALS: Partial<
  Record<PlaywrightRole, { email: string; password: string }>
> = {
  doctor: {
    email: process.env.PW_DOCTOR_EMAIL ?? "doctor@telecheck.com",
    password: process.env.PW_DOCTOR_PASSWORD ?? "DemoPassword123!",
  },
  patient: {
    email: process.env.PW_PATIENT_EMAIL ?? "patient@telecheck.com",
    password: process.env.PW_PATIENT_PASSWORD ?? "DemoPassword123!",
  },
  admin: {
    email: process.env.PW_ADMIN_EMAIL ?? "uat-admin@telecheck.com",
    password: process.env.PW_ADMIN_PASSWORD ?? "DemoPassword123!",
  },
};

type LoginResponse = {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      role: PlaywrightRole;
    };
    token: string;
    refreshToken?: string;
  };
};

async function attemptRealLogin(
  baseURL: string,
  role: PlaywrightRole,
): Promise<StorageState | null> {
  const creds = DEFAULT_CREDENTIALS[role];
  if (!creds) return null;

  try {
    const response = await fetch(`${baseURL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: creds.email, password: creds.password }),
    });

    if (!response.ok) {
      console.warn(
        `[Playwright Auth] Login failed for role ${role} (${response.status})`,
      );
      return null;
    }

    const payload = (await response.json()) as LoginResponse;
    if (!payload?.success || !payload.data?.token) {
      console.warn(
        `[Playwright Auth] Login response missing data for role ${role}`,
      );
      return null;
    }

    const apiUser = payload.data.user;
    const displayName = [apiUser.firstName, apiUser.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    const authUser: MockUser = {
      id: apiUser.id,
      email: apiUser.email,
      name: displayName.length > 0 ? displayName : apiUser.email,
      role: apiUser.role,
      permissions: ROLE_PERMISSIONS[apiUser.role] ?? [],
      isActive: true,
    };

    const storageState: StorageState = {
      cookies: [],
      origins: [
        {
          origin: new URL(baseURL).origin,
          localStorage: [
            { name: "telecheck_user", value: JSON.stringify(authUser) },
            { name: "auth_token", value: payload.data.token },
            ...(payload.data.refreshToken
              ? [{ name: "refresh_token", value: payload.data.refreshToken }]
              : []),
          ],
        },
      ],
    };

    return storageState;
  } catch (error) {
    console.warn(
      `[Playwright Auth] Error logging in for role ${role}:`,
      (error as Error).message,
    );
    return null;
  }
}

export async function createLoggedInState(
  baseURL: string,
  role: PlaywrightRole = "doctor",
  options?: { outputPath?: string },
) {
  const normalizedBase = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
  const targetPath = options?.outputPath ?? LOGGED_IN_STATE_PATH;

  const realState = await attemptRealLogin(normalizedBase, role);
  if (realState) {
    await writeState(targetPath, realState);
    return realState;
  }

  // Fallback to local mock state
  const origin = new URL(normalizedBase).origin;
  const user = ROLE_MOCKS[role] ?? ROLE_MOCKS.doctor;
  const token = buildToken(user);

  const storageState: StorageState = {
    cookies: [],
    origins: [
      {
        origin,
        localStorage: [
          { name: "telecheck_user", value: JSON.stringify(user) },
          { name: "auth_token", value: token },
        ],
      },
    ],
  };

  await writeState(targetPath, storageState);
  return storageState;
}

export async function createLoggedOutState() {
  const loggedOutState: StorageState = { cookies: [], origins: [] };
  await writeState(LOGGED_OUT_STATE_PATH, loggedOutState);
  return loggedOutState;
}

export default async function globalSetup(config: FullConfig) {
  const baseURL =
    (config.projects[0].use.baseURL as string) || "http://127.0.0.1:8080";
  await Promise.all([
    createLoggedInState(baseURL, "doctor"),
    createLoggedInState(baseURL, "patient", {
      outputPath: PATIENT_STATE_PATH,
    }),
    createLoggedOutState(),
  ]);
}
