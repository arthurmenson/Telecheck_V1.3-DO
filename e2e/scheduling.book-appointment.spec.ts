import { test, expect } from "@playwright/test";

test("Scheduling: slots → book → reschedule → cancel", async ({
  page,
  request,
  baseURL,
}) => {
  await page.goto("/ehr/scheduling");

  const slotsRes = await page.evaluate(async () => {
    const r = await fetch("/api/ehr/scheduling/slots");
    return r.json();
  });
  expect(slotsRes).toHaveProperty("slots");

  const booked = await page.evaluate(async () => {
    const r = await fetch("/api/ehr/scheduling/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId: "s1", patientId: "p1" }),
    });
    return r.json();
  });
  expect(booked).toMatchObject({ id: expect.any(String), status: "booked" });

  const rescheduled = await page.evaluate(async () => {
    const r = await fetch("/api/ehr/scheduling/apt1/reschedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: "2025-01-02T10:00:00Z" }),
    });
    return r.json();
  });
  expect(rescheduled).toMatchObject({
    id: expect.any(String),
    status: "rescheduled",
  });

  const canceled = await page.evaluate(async () => {
    const r = await fetch("/api/ehr/scheduling/apt1/cancel", {
      method: "POST",
    });
    return r.json();
  });
  expect(canceled).toMatchObject({
    id: expect.any(String),
    status: "canceled",
  });
});
