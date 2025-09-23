import { test, expect } from '@playwright/test';

test('eRx happy path: create → verify → poll → cancel', async ({ page }) => {
  // Login helper assumed exists in other specs; fallback to navigating directly
  await page.goto('/login');
  await page.fill('input[name="email"]', 'doctor@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button:has-text("Sign In")');

  await page.waitForURL('**/');
  await page.goto('/ehr/erx');

  await page.fill('#patientId', 'Patient/123');
  await page.fill('#medication', 'amoxicillin');
  await page.waitForTimeout(300); // allow debounce-ish results
  await page.click('text=amoxicillin', { trial: true }).catch(() => {});

  await page.click('button:has-text("Create Prescription")');
  await expect(page.locator('text=Created Rx ID')).toBeVisible();

  await page.fill('#otp', '123456');
  await page.click('button:has-text("Verify EPCS")');

  await page.click('button:has-text("Poll Now")');

  await page.click('button:has-text("Cancel")');
  await page.click('button:has-text("Poll Now")');
});


