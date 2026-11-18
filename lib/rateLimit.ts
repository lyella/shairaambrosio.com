import type { NextApiRequest, NextApiResponse } from "next";

// Simple in-memory sliding-window rate limiter.
// Note: on serverless (Vercel) each instance has its own store, so this is a
// best-effort guard per instance, not a global limit. For a hard global limit,
// back it with Vercel KV / Upstash instead.

type Bucket = {
  hits: number[];
};

const buckets = new Map<string, Bucket>();

const getClientKey = (req: NextApiRequest) => {
  const forwarded = req.headers["x-forwarded-for"];

  return (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0])?.trim() || req.socket.remoteAddress || "unknown";
};

export const rateLimit = (req: NextApiRequest, res: NextApiResponse, max: number, windowMs: number, scope: string) => {
  const key = `${scope}:${getClientKey(req)}`;
  const now = Date.now();
  const bucket = buckets.get(key) ?? { hits: [] };

  bucket.hits = bucket.hits.filter((ts) => now - ts < windowMs);

  if (bucket.hits.length >= max) {
    buckets.set(key, bucket);
    res.setHeader("Retry-After", Math.ceil((bucket.hits[0] + windowMs - now) / 1000));

    return false;
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);

  // Prevent unbounded growth of the map.
  if (buckets.size > 10_000) {
    buckets.clear();
  }

  return true;
};
