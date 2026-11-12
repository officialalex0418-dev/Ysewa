// @ts-nocheck
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { httpError } from "./error-handler.js";

export function authRequired(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers?.authorization;
  if (!header?.startsWith("Bearer ")) return next(httpError(401, "Missing or invalid Authorization header"));
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.jwtAccessSecret);
    req.user = {
      userId: payload.userId,
      role: payload.role,
      operatorId: payload.operatorId ?? null,
      counterId: payload.counterId ?? null,
    };
    next();
  } catch {
    next(httpError(401, "Invalid or expired access token"));
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers?.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const payload = jwt.verify(header.slice(7), env.jwtAccessSecret);
      req.user = payload;
    } catch {
      // ignore invalid token on optional routes
    }
  }
  next();
}
