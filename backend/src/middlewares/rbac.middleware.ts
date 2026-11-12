import type { Request, Response, NextFunction } from "express";
import { httpError } from "./error-handler.js";
import { DEFAULT_ROLE_PERMISSIONS, type PermissionCode } from "@yatrasewa/shared-types";

/**
 * Require that the authenticated user holds a permission matching the request.
 * SUPER_ADMIN bypasses all checks.
 *
 * NOTE: For production, permissions are loaded from Redis/database (dynamic RBAC).
 * For initial implementation we use the static DEFAULT_ROLE_PERMISSIONS from shared-types.
 */
export function requirePermission(permission: PermissionCode) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(httpError(401, "Authentication required"));
    if (req.user.role === "SUPER_ADMIN") return next();
    const rolePerms = DEFAULT_ROLE_PERMISSIONS[req.user.role] ?? [];
    if (!rolePerms.includes(permission) ) {
      return next(httpError(403, `Permission denied: ${permission}`));
    }
    next();
  };
}

/** Require one of a set of roles. */
export function requireRole(...roles: Array<keyof typeof DEFAULT_ROLE_PERMISSIONS>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(httpError(401, "Authentication required"));
    if (!roles.includes(req.user.role as any) ) {
      return next(httpError(403, `Role ${req.user.role} not permitted`));
    }
    next();
  };
}
