import { chromium, FullConfig } from "@playwright/test";

export async function createLoggedInState(baseURL: string, role: "patient" | "doctor" | "nurse" | "admin" = "doctor") {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(baseURL);
  const user = role === "doctor"
    ? { id: "2", email: "doctor@telecheck.com", name: "Dr. Sarah Wilson", role: "doctor", permissions: ["view_all_patients","prescribe_medications","review_labs","telehealth_consults","approve_treatments"], isActive: true }
    : { id: "1", email: "patient@telecheck.com", name: "John Patient", role: "patient", permissions: ["view_own_records","book_appointments","order_medications","view_lab_results"], isActive: true };
  await page.addInitScript(([u]) => {
    localStorage.setItem("telecheck_user", JSON.stringify(u));
    const tokenPayload = { userId: u.id, email: u.email, role: u.role, permissions: u.permissions, exp: Date.now() + 24*60*60*1000 };
    localStorage.setItem("auth_token", btoa(JSON.stringify(tokenPayload)));
  }, [user as any]);
  await page.reload();
  await context.storageState({ path: "e2e/.auth/state.json" });
  await browser.close();
}

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL as string || "http://127.0.0.1:8080";
  await createLoggedInState(baseURL, "doctor");
}
