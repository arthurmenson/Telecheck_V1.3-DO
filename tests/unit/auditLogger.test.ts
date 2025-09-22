import { beforeEach, describe, expect, it, vi } from "vitest";

const queryMock = vi.hoisted(() => vi.fn());
const loggerMock = vi.hoisted(() => {
  const base = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    fatal: vi.fn(),
    child: vi.fn(() => base),
  };

  return base;
});

vi.mock("../../server/config/database", () => ({
  dbPool: {
    query: queryMock,
  },
}));

vi.mock("../../server/utils/logger", () => ({
  logger: loggerMock,
}));

import { AuditLogger } from "../../server/utils/auditLogger";

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("AuditLogger", () => {
  beforeEach(() => {
    queryMock.mockReset();
    loggerMock.info.mockReset();
    loggerMock.warn.mockReset();
    loggerMock.error.mockReset();
    loggerMock.debug.mockReset();
    loggerMock.trace.mockReset();
    loggerMock.fatal.mockReset();
    loggerMock.child.mockReset();
  });

  it("persists structured audit events to the database", async () => {
    AuditLogger.logEvent({
      userId: "user-123",
      action: "update",
      resourceType: "patient",
      resourceId: "patient-1",
      details: { field: "value" },
      severity: "MEDIUM",
    });

    await flushPromises();

    expect(queryMock).toHaveBeenCalledTimes(1);
    const [sql, params] = queryMock.mock.calls[0];

    expect(sql).toContain("INSERT INTO audit_logs");
    expect(params[3]).toBe("RESOURCE_EVENT");
    expect(params[5]).toBe("patient");
    expect(params[6]).toBe("patient-1");
    expect(params[7]).toBe("MEDIUM");
    expect(params[11]).toEqual({ details: { field: "value" } });
  });

  it("handles persistence errors without throwing", async () => {
    queryMock.mockRejectedValueOnce(new Error("db down"));
    AuditLogger.logSystemEvent("test", "operation", { foo: "bar" });

    await flushPromises();

    expect(queryMock).toHaveBeenCalled();
    expect(loggerMock.warn).toHaveBeenCalled();
  });
});
