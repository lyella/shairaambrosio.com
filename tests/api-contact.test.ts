import { describe, expect, it, vi } from "vitest";

vi.mock("@sendgrid/mail", () => ({
  default: {
    setApiKey: vi.fn(),
    send: vi.fn().mockResolvedValue([{ statusCode: 202 }]),
  },
}));

vi.mock("lib/rateLimit", () => ({
  rateLimit: vi.fn().mockResolvedValue(true),
}));

import handler from "pages/api/contact";
import { mockReq, mockRes } from "./helpers";

describe("POST /api/contact", () => {
  it("rejects non-POST methods with 405 and Allow header", async () => {
    const res = mockRes();
    await handler(mockReq({ method: "GET" }), res);
    expect(res.statusCode).toBe(405);
    expect(res.headers["Allow"]).toBe("POST");
    expect(res.body).toEqual({ message: "Method not allowed" });
  });

  it("rejects an empty payload with 400", async () => {
    const res = mockRes();
    await handler(mockReq({ body: {} }), res);
    expect(res.statusCode).toBe(400);
    expect(typeof (res.body as { message: string }).message).toBe("string");
  });

  it("rejects a malformed email with a friendly message (no regex leak)", async () => {
    const res = mockRes();
    await handler(mockReq({ body: { name: "qa", email: "not-an-email", message: "hi" } }), res);
    expect(res.statusCode).toBe(400);
    expect((res.body as { message: string }).message).toBe("Please provide a valid email address");
  });

  it("accepts a valid payload and returns 200", async () => {
    const res = mockRes();
    await handler(mockReq({ body: { name: "qa", email: "qa@example.com", message: "hello" } }), res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Email has been sent!" });
  });

  it("never leaks internal error objects to the client", async () => {
    const sgMail = (await import("@sendgrid/mail")).default;
    vi.mocked(sgMail.send).mockRejectedValueOnce(new Error("sendgrid internal: api key invalid xyz"));
    const res = mockRes();
    await handler(mockReq({ body: { name: "qa", email: "qa@example.com", message: "hello" } }), res);
    expect(res.statusCode).toBe(400);
    expect(JSON.stringify(res.body)).not.toContain("sendgrid");
    expect(JSON.stringify(res.body)).not.toContain("api key");
  });
});
