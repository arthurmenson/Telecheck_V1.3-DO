import { test, expect, apiBaseUrl } from "./fixtures";

const PATIENT_EMAIL = process.env.PW_PATIENT_EMAIL ?? "patient@telecheck.com";
const PATIENT_PASSWORD = process.env.PW_PATIENT_PASSWORD ?? "DemoPassword123!";

test("RPM dashboard loads vitals + alerts", async ({ page }) => {
  const loginResponse = await page.request.post(
    `${apiBaseUrl}/api/auth/login`,
    {
      data: {
        email: PATIENT_EMAIL,
        password: PATIENT_PASSWORD,
      },
    },
  );

  expect(loginResponse.ok()).toBeTruthy();
  const payload = await loginResponse.json();

  expect(payload?.success).toBeTruthy();
  const { token, refreshToken, user } = payload.data;

  await page.addInitScript(
    ({ authToken, refresh, rawUser }) => {
      const displayName =
        `${rawUser?.firstName ?? ""} ${rawUser?.lastName ?? ""}`
          .trim()
          .replace(/\s+/g, " ");

      const resolvedUser = {
        id: rawUser.id,
        email: rawUser.email,
        name: displayName.length > 0 ? displayName : rawUser.email,
        role: rawUser.role,
        permissions: [
          "view_own_records",
          "book_appointments",
          "order_medications",
          "view_lab_results",
        ],
        isActive: true,
      };

      window.localStorage.setItem("auth_token", authToken);
      window.localStorage.setItem("refresh_token", refresh);
      window.localStorage.setItem(
        "telecheck_user",
        JSON.stringify(resolvedUser),
      );
    },
    { authToken: token, refresh: refreshToken, rawUser: user },
  );

  await page.goto(`/dashboard`, { waitUntil: "networkidle" });
  await expect(
    page.getByRole("heading", { name: /My Health Dashboard/i }),
  ).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/Recent Vital Readings/i)).toBeVisible();
  await expect(page.getByText(/Medication Plan/i)).toBeVisible();
});
