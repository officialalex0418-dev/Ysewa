// @ts-nocheck
import type { Request, Response, NextFunction } from "express";
import { redis } from "../config/redis.js";

export function idempotent() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = req.headers?.["idempotency-key"] as string | undefined;
    if (!key || req.method !== "POST") return next();

    req.idempotencyKey = key;
    const cacheKey = `idem:${req.user?.userId ?? "anon"}:${key}`;
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) {
      const parsed = JSON.parse(cached);
      res.status(parsed.status).setHeader("X-Idempotent-Replay", "true").json(parsed.body);
      return;
    }

    const originalJson = res.json.bind(res);
    res.json = ((body: unknown) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        redis.set(cacheKey, JSON.stringify({ status: res.statusCode, body }), "EX", 86400).catch(() => {});
      }
      return originalJson(body);
    }) as any;
    next();
  };
}
