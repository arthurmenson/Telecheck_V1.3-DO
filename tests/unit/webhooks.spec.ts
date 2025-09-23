import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  verifyTelnyxSignature,
  verifyTwilioSignature,
} from "../../server/routes/webhooks";
import crypto from "crypto";

function makeRes() {
  const res: any = {};
  res.statusCode = 200;
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.sent = undefined as any;
  res.send = (body: any) => {
    res.sent = body;
    return res;
  };
  return res;
}

describe("Webhooks verification", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.NODE_ENV = "production";
  });

  it("rejects Telnyx missing signature headers with 400", () => {
    const req: any = { header: () => undefined, rawBody: Buffer.from("") };
    const res = makeRes();
    let nextCalled = false;
    verifyTelnyxSignature(req, res as any, () => {
      nextCalled = true;
    });
    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(400);
  });

  it("rejects Telnyx invalid signature with 401", () => {
    const req: any = {
      header: (name: string) =>
        name === "Telnyx-Signature-Ed25519"
          ? "bad"
          : name === "Telnyx-Timestamp"
            ? "123"
            : undefined,
      rawBody: Buffer.from("body"),
    };
    const res = makeRes();
    process.env.TELNYX_PUBLIC_KEY = "PK";
    vi.spyOn(crypto, "createVerify").mockReturnValue({
      update: () => ({}) as any,
      verify: () => false,
    } as any);
    let nextCalled = false;
    verifyTelnyxSignature(req, res as any, () => {
      nextCalled = true;
    });
    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(401);
  });

  it("rejects Twilio missing signature with 400", () => {
    const req: any = {
      header: () => undefined,
      originalUrl: "/api/webhooks/twilio/sms",
      rawBody: Buffer.from("a"),
    };
    const res = makeRes();
    process.env.TWILIO_AUTH_TOKEN = "x";
    let nextCalled = false;
    verifyTwilioSignature(req, res as any, () => {
      nextCalled = true;
    });
    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(400);
  });

  it("rejects Twilio invalid signature with 401", () => {
    const req: any = {
      header: (n: string) => (n === "X-Twilio-Signature" ? "bad" : undefined),
      originalUrl: "/api/webhooks/twilio/sms",
      rawBody: Buffer.from("a"),
    };
    const res = makeRes();
    process.env.TWILIO_AUTH_TOKEN = "secret";
    process.env.BASE_URL = "http://localhost:3000";
    let nextCalled = false;
    verifyTwilioSignature(req, res as any, () => {
      nextCalled = true;
    });
    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(401);
  });

  it("accepts Twilio valid signature (form-encoded)", () => {
    process.env.TWILIO_AUTH_TOKEN = "secret";
    process.env.BASE_URL = "http://localhost:3000";
    const url = "/api/webhooks/twilio/sms";
    const body = new URLSearchParams({ A: "1", B: "2" }).toString();
    const fullUrl = `${process.env.BASE_URL}${url}`;

    // Build canonical string: URL + A1 + B2
    const dataToSign = fullUrl + "A" + "1" + "B" + "2";
    const signature = crypto
      .createHmac("sha1", "secret")
      .update(dataToSign)
      .digest("base64");

    const req: any = {
      header: (n: string) =>
        n === "X-Twilio-Signature" ? signature : undefined,
      originalUrl: url,
      headers: { "content-type": "application/x-www-form-urlencoded" },
      rawBody: Buffer.from(body),
    };
    const res: any = {
      status: (c: number) => {
        res.code = c;
        return res;
      },
      send: (_: any) => res,
    };
    let nextCalled = false;
    verifyTwilioSignature(req, res as any, () => {
      nextCalled = true;
    });
    expect(nextCalled).toBe(true);
  });
});
