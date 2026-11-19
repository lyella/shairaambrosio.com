import { describe, expect, it, vi } from "vitest";

vi.mock("utils/fetcher", () => ({
  fetcher: vi.fn().mockResolvedValue({}),
}));

vi.mock("lib/rateLimit", () => ({
  rateLimit: vi.fn().mockResolvedValue(true),
}));

import handler from "pages/api/newsletter";
import { mockReq, mockRes } from "./helpers";

describe("/api/newsletter", () => {
  it("rejects non-POST with 405", async () => {
    const res = mockRes();
    await handler(mockReq({ method: "GET" }), res);
    expect(res.statusCode).toBe(405);
    expect(res.headers["Allow"]).toBe("POST");
  });

  it("rejects a malformed email with 400 (validated server-side)", async () => {
    const { fetcher } = await import("utils/fetcher");
    const res = mockRes();
    await handler(mockReq({ body: { email: "junk" } }), res);
    expect(res.statusCode).toBe(400);
    expect((res.body as { message: string }).message).toBe("Please provide a valid email address");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("subscribes a valid email and returns 200", async () => {
    const { fetcher } = await import("utils/fetcher");
    const res = mockRes();
    await handler(mockReq({ body: { email: "new@example.com" } }), res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Subscribed!" });
    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining("subscribers"),
      expect.objectContaining({ method: "POST" }),
    );
  });
});
