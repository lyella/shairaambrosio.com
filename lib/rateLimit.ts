import type { NextApiRequest, NextApiResponse } from "next";

// Sliding-window rate limiter with two backends:
// - Vercel KV (fixed-window counter) when KV_REST_API_URL/KV_REST_API_TOKEN are set
//   -> a true global limit across all serverless instances.
// - In-memory fallback otherwise (per-instance best effort; fine for local dev and
//   low-traffic hobby tiers).
// To enable: create a KV store in the Vercel project and add the two env vars
// (see .env-sample), then redeploy.

const memoryBuckets = new Map<string, { hits: number[] }>();

const getClientKey = (req: NextApiRequest) => {
  const forwarded = req.headers["x-forwarded-for"];

  return (
    (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0])?.trim() ||
    req.socket.remoteAddress ||
    "unknown"
  );
};

const kvAvailable = () => Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

const kvAllow = async (key: string, max: number, windowMs: number) => {
  const windowStart = Math.floor(Date.now() / windowMs);
  const kvKey = `ratelimit:${key}:${windowStart}`;
  const url = `${process.env.KV_REST_API_URL}/incr/${encodeURIComponent(kvKey)}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
  });

  if (!res.ok) {
    throw new Error(`KV incr failed: ${res.status}`);
  }

  const { result } = (await res.json()) as { result: number };

  // Set the expiry once, when the counter is first created.
  if (result === 1) {
    await fetch(`${process.env.KV_REST_API_URL}/expire/${encodeURIComponent(kvKey)}/${Math.ceil(windowMs / 1000)}`, {
      headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
    });
  }

  return result <= max;
};

const memoryAllow = (key: string, max: number, windowMs: number) => {
  const now = Date.now();
  const bucket = memoryBuckets.get(key) ?? { hits: [] };

  bucket.hits = bucket.hits.filter((ts) => now - ts < windowMs);

  if (bucket.hits.length >= max) {
    memoryBuckets.set(key, bucket);

    return false;
  }

  bucket.hits.push(now);
  memoryBuckets.set(key, bucket);

  // Prevent unbounded growth of the map.
  if (memoryBuckets.size > 10_000) {
    memoryBuckets.clear();
  }

  return true;
};

export const rateLimit = async (
  req: NextApiRequest,
  res: NextApiResponse,
  max: number,
  windowMs: number,
  scope: string,
) => {
  const key = `${scope}:${getClientKey(req)}`;

  try {
    if (kvAvailable()) {
      const allowed = await kvAllow(key, max, windowMs);

      if (!allowed) {
        res.setHeader("Retry-After", Math.ceil(windowMs / 1000));
      }

      return allowed;
    }
  } catch (e) {
    // If KV is unreachable, degrade to the in-memory limiter rather than failing open.
    console.error("[rateLimit] KV backend failed, falling back to in-memory:", e);
  }

  const allowed = memoryAllow(key, max, windowMs);

  if (!allowed) {
    res.setHeader("Retry-After", Math.ceil(windowMs / 1000));
  }

  return allowed;
};
