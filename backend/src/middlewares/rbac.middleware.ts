// @ts-nocheck
import type { Request, Response, NextFunction } from "express";
import { httpError } from "./error-handler.js";

export function requirePermission(permission: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(httpError(401, "Authentication required"));
    if (req.user.role === "SUPER_ADMIN") return next();
    next();
  };
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(httpError(401, "Authentication required"));
    if (!roles.includes(req.user.role as any) && req.user.role !== "SUPER_ADMIN") {
      return next(httpError(403, `Role ${req.user.role} not permitted`));
    }
    next();
  };
}
