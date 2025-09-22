import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const patientStore = vi.hoisted(() => new Map<string, any>());

vi.mock("../../server/services/patient.service", () => {
  const { randomUUID } = require("crypto");

  const getStore = () => patientStore as Map<string, any>;

  const normalizeDateOfBirth = (value: string | Date | undefined) => {
    if (!value) {
      return new Date().toISOString();
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    return new Date(value).toISOString();
  };

  const buildPatientRecord = (
    data: Record<string, any>,
    overrides: Record<string, any> = {},
  ) => {
    const now = new Date().toISOString();

    return {
      id: overrides.id ?? randomUUID(),
      userId: overrides.userId ?? randomUUID(),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone ?? null,
      dateOfBirth: normalizeDateOfBirth(data.dateOfBirth),
      gender: data.gender ?? null,
      address: data.address ?? null,
      city: data.city ?? null,
      state: data.state ?? null,
      zipCode: data.zipCode ?? null,
      allergies: data.allergies ?? [],
      emergencyContacts: data.emergencyContacts ?? {},
      insuranceInfo: data.insuranceInfo ?? {},
      primaryProviderId: data.primaryProviderId ?? null,
      status: overrides.status ?? "active",
      mrn: overrides.mrn ?? `MRN-${Math.floor(Math.random() * 1_000_000)}`,
      createdAt: overrides.createdAt ?? now,
      updatedAt: overrides.updatedAt ?? now,
      providerName: overrides.providerName ?? null,
      lastAppointment: overrides.lastAppointment ?? null,
      lastVitals: overrides.lastVitals ?? null,
      activeConditions: overrides.activeConditions ?? [],
      currentMedications: overrides.currentMedications ?? [],
    };
  };

  return {
    PatientService: {
      async createPatient(data: Record<string, any>) {
        const patient = buildPatientRecord(data);
        getStore().set(patient.id, patient);
        return patient;
      },
      async getPatientById(id: string) {
        return getStore().get(id) ?? null;
      },
      async updatePatient(id: string, updates: Record<string, any>) {
        const existing = getStore().get(id);
        if (!existing) {
          return null;
        }

        const updated = {
          ...existing,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        getStore().set(id, updated);
        return updated;
      },
      async searchPatients(
        filters: Record<string, any> = {},
        page = 1,
        limit = 20,
      ) {
        const normalizedQuery = (filters.query || "").toLowerCase();
        const normalizedStatus = filters.status || undefined;

        let results = Array.from(getStore().values()).filter(
          (patient: any) => patient.status !== "archived",
        );

        if (normalizedStatus) {
          results = results.filter(
            (patient: any) => normalizedStatus === patient.status,
          );
        }

        if (normalizedQuery) {
          results = results.filter((patient: any) =>
            [patient.firstName, patient.lastName, patient.email]
              .filter(Boolean)
              .some((value) =>
                String(value).toLowerCase().includes(normalizedQuery),
              ),
          );
        }

        const total = results.length;
        const start = (page - 1) * limit;
        const paginated = results.slice(start, start + limit);

        return {
          patients: paginated,
          total,
          page,
          limit,
          totalPages: total === 0 ? 0 : Math.ceil(total / limit),
        };
      },
      async getPatientStats() {
        const values = Array.from(getStore().values()).filter(
          (patient: any) => patient.status !== "archived",
        );

        const now = Date.now();
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

        const getAge = (dob: string) => {
          const birth = new Date(dob).getTime();
          const diff = now - birth;
          return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
        };

        return {
          total_patients: values.length,
          active_patients: values.filter((p: any) => p.status === "active")
            .length,
          inactive_patients: values.filter((p: any) => p.status === "inactive")
            .length,
          new_this_month: values.filter(
            (p: any) => new Date(p.createdAt).getTime() >= thirtyDaysAgo,
          ).length,
          pediatric_patients: values.filter(
            (p: any) => getAge(p.dateOfBirth) < 18,
          ).length,
          senior_patients: values.filter(
            (p: any) => getAge(p.dateOfBirth) >= 65,
          ).length,
        };
      },
      async archivePatient(id: string) {
        const existing = getStore().get(id);
        if (!existing) {
          return false;
        }
        getStore().set(id, {
          ...existing,
          status: "archived",
          updatedAt: new Date().toISOString(),
        });
        return true;
      },
      async getPatientAppointments() {
        return [];
      },
      async getPatientVitals() {
        return [];
      },
    },
    __resetPatients: () => {
      getStore().clear();
    },
  };
});

describe("Patient API", () => {
  const buildPatientPayload = (overrides: Record<string, any> = {}) => ({
    firstName: "Alice",
    lastName: "Example",
    email: `alice-${Math.random().toString(16).slice(2)}@example.com`,
    phone: "+15555550123",
    dateOfBirth: "1990-01-01",
    gender: "female",
    address: "123 Main St",
    city: "Metropolis",
    state: "NY",
    zipCode: "10001",
    allergies: ["penicillin"],
    emergencyContacts: { primary: { name: "Bob", phone: "+15555550124" } },
    insuranceInfo: { provider: "HealthCo" },
    ...overrides,
  });

  const registerAndLogin = async (role: string = "admin") => {
    const credentials = {
      email: `user-${Math.random().toString(16).slice(2)}@example.com`,
      password: "TestPassword123!",
      firstName: "Test",
      lastName: "Admin",
      role,
      phone: "+15555551234",
    };

    await request(global.testApp).post("/api/auth/register").send(credentials);

    const login = await request(global.testApp)
      .post("/api/auth/login")
      .send({ email: credentials.email, password: credentials.password })
      .expect(200);

    return {
      token: login.body.token as string,
      userId: login.body.user.id as string,
    };
  };

  beforeEach(async () => {
    const patientModule = (await import(
      "../../server/services/patient.service"
    )) as any;
    patientModule.__resetPatients();
  });

  it("requires authentication for patient stats", async () => {
    await request(global.testApp).get("/api/patients/stats").expect(401);
  });

  it("allows an admin to create and retrieve a patient", async () => {
    const { token } = await registerAndLogin("admin");
    const payload = buildPatientPayload();

    const createResponse = await request(global.testApp)
      .post("/api/patients")
      .set("Authorization", `Bearer ${token}`)
      .send(payload)
      .expect(201);

    expect(createResponse.body).toMatchObject({
      success: true,
      message: "Patient created successfully",
    });
    expect(createResponse.body.data).toMatchObject({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      status: "active",
    });

    const patientId = createResponse.body.data.id as string;

    const fetchResponse = await request(global.testApp)
      .get(`/api/patients/${patientId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(fetchResponse.body).toMatchObject({
      success: true,
    });
    expect(fetchResponse.body.data).toMatchObject({
      id: patientId,
      email: payload.email,
      firstName: payload.firstName,
    });
  });

  it("filters patients by search query and status", async () => {
    const { token } = await registerAndLogin("admin");

    const activePatient = buildPatientPayload({
      firstName: "Active",
      email: "active@example.com",
    });
    const inactivePatient = buildPatientPayload({
      firstName: "Inactive",
      email: "inactive@example.com",
    });

    await request(global.testApp)
      .post("/api/patients")
      .set("Authorization", `Bearer ${token}`)
      .send(activePatient)
      .expect(201);

    const inactiveCreate = await request(global.testApp)
      .post("/api/patients")
      .set("Authorization", `Bearer ${token}`)
      .send(inactivePatient)
      .expect(201);

    await request(global.testApp)
      .put(`/api/patients/${inactiveCreate.body.data.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "inactive" })
      .expect(200);

    const searchResponse = await request(global.testApp)
      .get("/api/patients/search")
      .set("Authorization", `Bearer ${token}`)
      .query({ query: "inactive", status: "inactive" })
      .expect(200);

    expect(searchResponse.body.success).toBe(true);
    expect(searchResponse.body.data.total).toBe(1);
    expect(searchResponse.body.data.patients[0].email).toBe(
      "inactive@example.com",
    );
  });

  it("summarizes patient statistics", async () => {
    const { token } = await registerAndLogin("admin");

    await request(global.testApp)
      .post("/api/patients")
      .set("Authorization", `Bearer ${token}`)
      .send(
        buildPatientPayload({
          firstName: "Child",
          dateOfBirth: "2015-05-05",
        }),
      )
      .expect(201);

    await request(global.testApp)
      .post("/api/patients")
      .set("Authorization", `Bearer ${token}`)
      .send(
        buildPatientPayload({
          firstName: "Senior",
          dateOfBirth: "1940-06-06",
        }),
      )
      .expect(201);

    const statsResponse = await request(global.testApp)
      .get("/api/patients/stats")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(statsResponse.body.success).toBe(true);
    expect(statsResponse.body.data.total_patients).toBe(2);
    expect(statsResponse.body.data.pediatric_patients).toBeGreaterThanOrEqual(
      1,
    );
    expect(statsResponse.body.data.senior_patients).toBeGreaterThanOrEqual(1);
  });
});
