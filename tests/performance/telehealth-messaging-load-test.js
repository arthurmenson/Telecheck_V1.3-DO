import http from "k6/http";
import { check, group, sleep } from "k6";
import { Counter, Trend } from "k6/metrics";

export const options = {
  stages: [
    { duration: "1m", target: 10 },
    { duration: "2m", target: 30 },
    { duration: "2m", target: 30 },
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.02"],
    http_req_duration: ["p(95)<1000", "avg<400"],
    telecheck_telehealth_schedule_duration: ["avg<600", "p(95)<1500"],
    telecheck_messaging_status_duration: ["avg<300", "p(95)<750"],
  },
  summaryTrendStats: ["avg", "min", "med", "p(90)", "p(95)", "max"],
};

const baseUrl = __ENV.TELECHECK_BASE_URL || "http://localhost:3000";
const adminEmail = __ENV.TELECHECK_ADMIN_EMAIL || "admin@example.com";
const adminPassword = __ENV.TELECHECK_ADMIN_PASSWORD || "password";

const appointmentsScheduled = new Counter("telecheck_appointments_scheduled");
const telehealthScheduleDuration = new Trend(
  "telecheck_telehealth_schedule_duration",
);
const telehealthRoomDuration = new Trend("telecheck_telehealth_room_duration");
const telehealthSummaryDuration = new Trend(
  "telecheck_telehealth_summary_duration",
);
const messagingStatusDuration = new Trend(
  "telecheck_messaging_status_duration",
);
const messagingSelfTestDuration = new Trend(
  "telecheck_messaging_self_test_duration",
);

function authenticate() {
  const payload = JSON.stringify({
    email: adminEmail,
    password: adminPassword,
  });

  const headers = { "Content-Type": "application/json" };
  const res = http.post(`${baseUrl}/api/auth/login`, payload, { headers });

  check(res, {
    "login succeeded": (r) => r.status === 200,
  });

  return {
    accessToken: res.json("token"),
    refreshToken: res.json("refreshToken"),
    user: res.json("user"),
    response: res,
  };
}

function authHeaders(token, extra = {}) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

export default function main() {
  const auth = authenticate();
  const accessToken = auth.accessToken;
  const userId = auth.user?.id || "telecheck-load-user";

  if (!accessToken) {
    sleep(1);
    return;
  }

  group("telehealth workflows", () => {
    const providersRes = http.get(
      `${baseUrl}/api/telemedicine/providers?specialty=cardiology`,
      {
        headers: authHeaders(accessToken),
      },
    );

    check(providersRes, {
      "providers fetched": (r) =>
        r.status === 200 && r.json("data")?.length >= 0,
    });

    const schedulePayload = JSON.stringify({
      providerId: "provider_1",
      userId,
      dateTime: new Date(Date.now() + 10 * 60000).toISOString(),
      type: "video",
      reason: "Telehealth load verification",
      duration: 30,
    });

    const scheduleRes = http.post(
      `${baseUrl}/api/telemedicine/schedule`,
      schedulePayload,
      { headers: authHeaders(accessToken) },
    );
    telehealthScheduleDuration.add(scheduleRes.timings.duration);

    check(scheduleRes, {
      "appointment scheduled": (r) =>
        r.status === 200 && r.json("data")?.appointmentId,
    });

    const appointment = scheduleRes.json("data") || {};
    if (appointment.appointmentId) {
      appointmentsScheduled.add(1);

      const roomRes = http.post(
        `${baseUrl}/api/telemedicine/room`,
        JSON.stringify({ appointmentId: appointment.appointmentId }),
        { headers: authHeaders(accessToken) },
      );
      telehealthRoomDuration.add(roomRes.timings.duration);

      check(roomRes, {
        "consult room created": (r) =>
          r.status === 200 && r.json("data")?.roomId,
      });

      const room = roomRes.json("data") || {};
      if (room.roomId) {
        const summaryRes = http.get(
          `${baseUrl}/api/telemedicine/summary/${room.roomId}`,
          { headers: authHeaders(accessToken) },
        );
        telehealthSummaryDuration.add(summaryRes.timings.duration);
        check(summaryRes, {
          "summary generated": (r) => r.status === 200 && r.json("data"),
        });
      }

      const appointmentsRes = http.get(
        `${baseUrl}/api/telemedicine/appointments/${userId}`,
        { headers: authHeaders(accessToken) },
      );

      check(appointmentsRes, {
        "appointments listed": (r) => r.status === 200,
      });
    }

    const triageRes = http.post(
      `${baseUrl}/api/telemedicine/triage`,
      JSON.stringify({
        symptoms: ["dizziness", "palpitations"],
        vitals: { heartRate: 110, bloodPressure: "150/95" },
      }),
      { headers: authHeaders(accessToken) },
    );

    check(triageRes, {
      "triage completed": (r) => r.status === 200,
    });
  });

  group("messaging readiness", () => {
    const headers = authHeaders(accessToken, { "user-id": userId });

    const statusRes = http.get(`${baseUrl}/api/messaging/status`, { headers });
    messagingStatusDuration.add(statusRes.timings.duration);
    check(statusRes, {
      "messaging status healthy": (r) =>
        r.status === 200 && r.json("success") === true,
    });

    const selfTestRes = http.post(
      `${baseUrl}/api/messaging/test`,
      JSON.stringify({ provider: "both" }),
      { headers },
    );
    messagingSelfTestDuration.add(selfTestRes.timings.duration);
    check(selfTestRes, {
      "messaging self-test ok": (r) =>
        r.status === 200 && r.json("success") === true,
    });
  });

  sleep(1);
}
