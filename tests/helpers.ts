import type { NextApiRequest, NextApiResponse } from "next";

export const mockRes = () => {
  const res = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: undefined as unknown,
    setHeader(k: string, v: string) {
      this.headers[k] = v;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res as unknown as NextApiResponse & typeof res;
};

export const mockReq = (opts: { method?: string; body?: unknown; ip?: string } = {}) =>
  ({
    method: opts.method ?? "POST",
    headers: {},
    body: opts.body ?? {},
    socket: { remoteAddress: opts.ip ?? "10.0.0.1" },
  }) as unknown as NextApiRequest;
