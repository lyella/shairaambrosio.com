import { describe, expect, it } from "vitest";

import { rateLimit } from "lib/rateLimit";
import { mockReq, mockRes } from "./helpers";

describe("rateLimit (in-memory fallback)", () => {
  it("allows up to max requests then denies with Retry-After", async () => {
    const req = mockReq({ ip: "192.0.2.10" });
    for (let i = 0; i < 5; i++) {
      expect(await rateLimit(req, mockRes(), 5, 60_000, "t-allow")).toBe(true);
    }
    const res = mockRes();
    expect(await rateLimit(req, res, 5, 60_000, "t-allow")).toBe(false);
    expect(res.headers["Retry-After"]).toBeDefined();
  });

  it("scopes limits per route, not just per IP", async () => {
    const req = mockReq({ ip: "192.0.2.11" });
    for (let i = 0; i < 3; i++) {
      expect(await rateLimit(req, mockRes(), 3, 60_000, "t-a")).toBe(true);
    }
    expect(await rateLimit(req, mockRes(), 3, 60_000, "t-a")).toBe(false);
    // same IP, different scope: still allowed
    expect(await rateLimit(req, mockRes(), 3, 60_000, "t-b")).toBe(true);
  });

  it("tracks different IPs independently", async () => {
    const a = mockReq({ ip: "192.0.2.20" });
    const b = mockReq({ ip: "192.0.2.21" });
    await rateLimit(a, mockRes(), 1, 60_000, "t-ip");
    expect(await rateLimit(a, mockRes(), 1, 60_000, "t-ip")).toBe(false);
    expect(await rateLimit(b, mockRes(), 1, 60_000, "t-ip")).toBe(true);
  });
});
