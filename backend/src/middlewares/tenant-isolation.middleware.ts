import type { Request, Response, NextFunction } from "express";
import { prisma } from "@yatrasewa/database";
import { httpError } from "./error-handler.js";

/**
 * For operator-scoped roles, enforce that :operatorId params match req.user.operatorId.
 * For Bookie, enforce :counterId matches.
 *
 * Super Admin and System Employees bypass this check (they have cross-tenant access).
 */
export function tenantIsolation(paramName: string = "operatorId") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return next(httpError(401, "Authentication required"));
    if (user.role === "SUPER_ADMIN" || user.role === "SYSTEM_EMPLOYEE") return next();

    const param = req.params[paramName];
    if (paramName === "operatorId") {
      if (user.operatorId && param && param !== user.operatorId) {
        return next(httpError(403, "Cross-operator access denied"));
      }
    } else if (paramName === "counterId") {
      if (user.counterId && param && param !== user.counterId) {
        return next(httpError(403, "Cross-counter access denied"));
      }
    }
    next();
  };
}

/**
 * Helper that returns a Prisma where clause scoped to the user's tenant.
 * Use in controllers: prisma.trip.findMany({ where: tenantScope(req) })
 */
export function tenantScope(req: Request): Record<string, unknown> {
  const u = req.user;
  if (!u) return {};
  if (u.role === "SUPER_ADMIN" || u.role === "SYSTEM_EMPLOYEE") return {};
  if (u.role === "BOOKIE_COUNTER") return { counterId: u.counterId };
  if (u.counterId) return { counterId: u.counterId };
  if (u.operatorId) return { operatorId: u.operatorId };
  // CUSTOMER scope: only own bookings
  if (u.role === "CUSTOMER") return { userId: u.userId };
  // Driver/Conductor: scoped via trip assignment (handled separately)
  return {};
}

export { prisma };
