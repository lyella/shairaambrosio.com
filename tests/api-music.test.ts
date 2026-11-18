import { describe, expect, it, vi } from "vitest";

vi.mock("utils/fetcher", () => ({
  fetcher: vi.fn(),
}));

import handler from "pages/api/music";
import { mockReq, mockRes } from "./helpers";

describe("/api/music", () => {
  it("rejects non-GET with 405", async () => {
    const res = mockRes();
    await handler(mockReq({ method: "POST" }), res);
    expect(res.statusCode).toBe(405);
    expect(res.headers["Allow"]).toBe("GET");
  });

  it("returns the currently playing track with 200", async () => {
    const { fetcher } = await import("utils/fetcher");
    vi.mocked(fetcher).mockImplementation(async (url: string) => {
      if (url.includes("accounts.spotify.com")) return { access_token: "tok" };
      return { item: { name: "Song" }, is_playing: true };
    });
    const res = mockRes();
    await handler(mockReq({ method: "GET" }), res);
    expect(res.statusCode).toBe(200);
    expect((res.body as { status: string }).status).toBe("online");
    expect(res.headers["Cache-Control"]).toContain("s-maxage=60");
  });

  it("degrades to 200 offline when the Spotify token flow fails", async () => {
    const { fetcher } = await import("utils/fetcher");
    vi.mocked(fetcher).mockRejectedValue(new Error("invalid refresh token"));
    const res = mockRes();
    await handler(mockReq({ method: "GET" }), res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ track: null, status: "offline" });
  });
});
