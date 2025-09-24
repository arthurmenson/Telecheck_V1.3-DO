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

export async function createLoggedInState(
  baseURL: string,
  role: PlaywrightRole = "doctor",
  options?: { outputPath?: string },
) {
  const origin = new URL(baseURL).origin;
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

  const targetPath = options?.outputPath ?? LOGGED_IN_STATE_PATH;
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
