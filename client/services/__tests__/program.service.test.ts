import { vi, describe, it, expect, beforeEach } from "vitest";
import { ProgramService, Program } from "../api.service";
import { API_ENDPOINTS } from "../../lib/api-endpoints";

const { mockApiClient } = vi.hoisted(() => ({
  mockApiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../../lib/api-client", () => ({
  apiClient: mockApiClient,
}));

describe("ProgramService", () => {
  const programPayload: Program = {
    id: "program-1",
    title: "Cardiac Rehab",
    description: "12 week cardiac rehabilitation program",
    type: "rolling-start",
    duration: "12 weeks",
    enrolledParticipants: 10,
    maxParticipants: 20,
    status: "active",
    category: "cardiology",
    price: 299,
    coach: "Dr. Smith",
    completionRate: 80,
    rating: 4.5,
  } as Program;

  beforeEach(() => {
    vi.clearAllMocks();
    mockApiClient.get.mockReset().mockResolvedValue({ success: true });
    mockApiClient.post.mockReset().mockResolvedValue({ success: true });
    mockApiClient.put.mockReset().mockResolvedValue({ success: true });
    mockApiClient.delete.mockReset().mockResolvedValue({ success: true });
  });

  it("fetches program list", async () => {
    await ProgramService.getPrograms();
    expect(mockApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.EHR.PROGRAMS.LIST);
  });

  it("fetches program detail by id", async () => {
    const programId = "abc123";
    await ProgramService.getProgram(programId);
    expect(mockApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.EHR.PROGRAMS.UPDATE(programId));
  });

  it("creates a program", async () => {
    const payload = { ...programPayload };
    delete (payload as any).id;
    await ProgramService.createProgram(payload as Omit<Program, "id">);
    expect(mockApiClient.post).toHaveBeenCalledWith(
      API_ENDPOINTS.EHR.PROGRAMS.CREATE,
      payload,
    );
  });

  it("updates a program", async () => {
    const programId = programPayload.id;
    const updates = { title: "Updated" };
    await ProgramService.updateProgram(programId, updates);
    expect(mockApiClient.put).toHaveBeenCalledWith(
      API_ENDPOINTS.EHR.PROGRAMS.UPDATE(programId),
      updates,
    );
  });

  it("deletes a program", async () => {
    const programId = programPayload.id;
    await ProgramService.deleteProgram(programId);
    expect(mockApiClient.delete).toHaveBeenCalledWith(
      API_ENDPOINTS.EHR.PROGRAMS.DELETE(programId),
    );
  });

  it("enrolls a participant", async () => {
    const programId = programPayload.id;
    const participant = { patientId: "patient-1" };
    await ProgramService.enrollParticipant(programId, participant);
    expect(mockApiClient.post).toHaveBeenCalledWith(
      API_ENDPOINTS.EHR.PROGRAMS.ENROLL(programId),
      participant,
    );
  });

  it("fetches participants", async () => {
    const programId = programPayload.id;
    await ProgramService.getProgramParticipants(programId);
    expect(mockApiClient.get).toHaveBeenCalledWith(
      API_ENDPOINTS.EHR.PROGRAMS.PARTICIPANTS(programId),
    );
  });

  it("fetches program analytics", async () => {
    const programId = programPayload.id;
    await ProgramService.getProgramAnalytics(programId);
    expect(mockApiClient.get).toHaveBeenCalledWith(
      API_ENDPOINTS.EHR.PROGRAMS.ANALYTICS(programId),
    );
  });
});
