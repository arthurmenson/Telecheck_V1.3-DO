import { test, expect } from "./fixtures";

test("Scheduling: slots ?+' book ?+' reschedule ?+' cancel", async ({
  page,
  request,
}) => {
  await page.goto("/ehr/scheduling");

  const slotsResponse = await request.get("/api/ehr/scheduling/slots");
  expect(slotsResponse.ok()).toBeTruthy();
  const slotsPayload = await slotsResponse.json();
  const slots = slotsPayload.data?.slots ?? slotsPayload.slots;
  expect(Array.isArray(slots)).toBeTruthy();
  expect(slots.length).toBeGreaterThan(0);

  const bookedResponse = await request.post("/api/ehr/scheduling/book", {
    data: { slotId: "s1", patientId: "p1" },
  });
  expect(bookedResponse.ok()).toBeTruthy();
  const bookedPayload = await bookedResponse.json();
  const booked = bookedPayload.data ?? bookedPayload;
  expect(booked).toMatchObject({ id: expect.any(String), status: "booked" });

  const rescheduledResponse = await request.post(
    "/api/ehr/scheduling/apt1/reschedule",
    {
      data: { to: "2025-01-02T10:00:00Z" },
    },
  );
  expect(rescheduledResponse.ok()).toBeTruthy();
  const rescheduledPayload = await rescheduledResponse.json();
  const rescheduled = rescheduledPayload.data ?? rescheduledPayload;
  expect(rescheduled).toMatchObject({
    id: expect.any(String),
    status: "rescheduled",
  });

  const canceledResponse = await request.post(
    "/api/ehr/scheduling/apt1/cancel",
  );
  expect(canceledResponse.ok()).toBeTruthy();
  const canceledPayload = await canceledResponse.json();
  const canceled = canceledPayload.data ?? canceledPayload;
  expect(canceled).toMatchObject({
    id: expect.any(String),
    status: "canceled",
  });
});
