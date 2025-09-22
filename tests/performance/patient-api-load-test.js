import http from "k6/http";
import { check, group, sleep } from "k6";
import { Counter, Trend } from "k6/metrics";

export const options = {
  stages: [
    { duration: "2m", target: 20 },
    { duration: "3m", target: 50 },
    { duration: "2m", target: 50 },
    { duration: "2m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<750", "avg<300"],
    http_req_failed: ["rate<0.01"],
  },
  summaryTrendStats: ["avg", "min", "med", "p(90)", "p(95)", "max"],
};

const baseUrl = __ENV.TELECHECK_BASE_URL || "http://localhost:3000";
const adminEmail = __ENV.TELECHECK_ADMIN_EMAIL || "admin@example.com";
const adminPassword = __ENV.TELECHECK_ADMIN_PASSWORD || "password";

const createdPatients = new Counter("telecheck_patients_created");
const loginDuration = new Trend("telecheck_login_duration");
const patientCreationDuration = new Trend(
  "telecheck_patient_creation_duration",
);
const patientSearchDuration = new Trend("telecheck_patient_search_duration");

function authenticate() {
  const payload = JSON.stringify({
    email: adminEmail,
    password: adminPassword,
  });

  const headers = { "Content-Type": "application/json" };

  const res = http.post(`${baseUrl}/api/auth/login`, payload, { headers });

  loginDuration.add(res.timings.duration);

  check(res, {
    "login succeeded": (r) => r.status === 200,
    "access token returned": (r) => Boolean(r.json("token")),
    "refresh token returned": (r) => Boolean(r.json("refreshToken")),
  });

  return {
    accessToken: res.json("token"),
    refreshToken: res.json("refreshToken"),
  };
}

function createPatient(token) {
  const payload = JSON.stringify({
    firstName: "Load",
    lastName: `Tester-${Math.random().toString(16).slice(2, 10)}`,
    email: `load-${Math.random().toString(16).slice(2, 10)}@example.com`,
    phone: "+15555550123",
    dateOfBirth: "1990-01-01",
    gender: "female",
    address: "123 Main St",
    city: "Metropolis",
    state: "NY",
    zipCode: "10001",
  });

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const res = http.post(`${baseUrl}/api/patients`, payload, { headers });
  patientCreationDuration.add(res.timings.duration);

  check(res, {
    "patient created": (r) => r.status === 201,
    "patient id returned": (r) => Boolean(r.json("id")),
  });

  if (res.status === 201) {
    createdPatients.add(1);
    return res.json("id");
  }

  return undefined;
}

function searchPatients(token) {
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const res = http.get(`${baseUrl}/api/patients?limit=25`, { headers });
  patientSearchDuration.add(res.timings.duration);

  check(res, {
    "patient search ok": (r) => r.status === 200,
    "patient list returned": (r) => Array.isArray(r.json("patients")),
  });
}

export default function () {
  group("auth", () => {
    const { accessToken } = authenticate();
    if (!accessToken) {
      return;
    }

    group("patients", () => {
      const patientId = createPatient(accessToken);
      if (patientId) {
        http.get(`${baseUrl}/api/patients/${patientId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      }

      searchPatients(accessToken);
    });
  });

  sleep(1);
}
