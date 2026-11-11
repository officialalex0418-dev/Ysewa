import { z } from "zod";

/**
 * 7 YatraSewa roles, as specified in memory.md.
 */
export const RoleEnum = z.enum([
  "SUPER_ADMIN",
  "SYSTEM_EMPLOYEE",
  "OPERATOR_OWNER",
  "OPERATOR_STAFF",
  "DRIVER",
  "CONDUCTOR",
  "BOOKIE_COUNTER",
  "CUSTOMER",
]);
export type Role = z.infer<typeof RoleEnum>;

/** Permission modules */
export const PermissionModuleEnum = z.enum([
  "auth",
  "roles",
  "companies",
  "kyc",
  "fleet",
  "cabins",
  "routes",
  "trips",
  "seats",
  "bookings",
  "payments",
  "ledger",
  "settlements",
  "telemetry",
  "notifications",
  "reports",
  "audit",
  "customers",
  "bookie",
  "staff",
  "conductor",
]);
export type PermissionModule = z.infer<typeof PermissionModuleEnum>;

/** Permission actions */
export const PermissionActionEnum = z.enum([
  "create",
  "read",
  "update",
  "delete",
  "approve",
  "lock",
  "verify",
  "cancel",
  "refund",
  "dispatch",
  "checkin",
  "print",
  "scan",
  "manage",
]);
export type PermissionAction = z.infer<typeof PermissionActionEnum>;

/** Permission scopes */
export const PermissionScopeEnum = z.enum(["all", "operator", "counter", "own"]);
export type PermissionScope = z.infer<typeof PermissionScopeEnum>;

/**
 * Permission code format: "module:action:scope"
 * Examples: "seats:lock:counter", "settlements:approve:all", "trips:read:own"
 */
export const PermissionCodeSchema = z
  .string()
  .regex(/^[a-z]+:[a-z]+:(all|operator|counter|own)$/);
export type PermissionCode = z.infer<typeof PermissionCodeSchema>;

export const RoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  isSystemRole: z.boolean(),
  description: z.string().nullable(),
  permissions: z.array(PermissionCodeSchema),
});
export type RoleDefinition = z.infer<typeof RoleSchema>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string(),
  phone: z.string().nullable(),
  email: z.string().email().nullable(),
  role: RoleEnum,
  operatorId: z.string().nullable(),
  counterId: z.string().nullable(),
  isActive: z.boolean(),
  is2faEnabled: z.boolean(),
  createdAt: z.coerce.date(),
});
export type User = z.infer<typeof UserSchema>;

/** Default permission matrix for system roles (used by seeds and tests) */
export const DEFAULT_ROLE_PERMISSIONS: Record<Role, PermissionCode[]> = {
  SUPER_ADMIN: [
    "roles:manage:all",
    "companies:manage:all",
    "kyc:approve:all",
    "settlements:approve:all",
    "ledger:read:all",
    "reports:read:all",
    "audit:read:all",
    "customers:manage:all",
    "fleet:read:all",
    "trips:read:all",
    "bookings:read:all",
    "staff:manage:all",
  ],
  SYSTEM_EMPLOYEE: [
    "companies:read:all",
    "kyc:verify:all",
    "reports:read:operator",
    "bookings:read:all",
    "customers:read:all",
  ],
  OPERATOR_OWNER: [
    "fleet:manage:operator",
    "cabins:manage:operator",
    "routes:manage:operator",
    "trips:manage:operator",
    "bookings:read:operator",
    "bookings:cancel:operator",
    "ledger:read:operator",
    "settlements:read:operator",
    "telemetry:read:operator",
    "staff:manage:operator",
    "notifications:create:operator",
  ],
  OPERATOR_STAFF: [
    "fleet:read:operator",
    "trips:read:operator",
    "trips:dispatch:operator",
    "bookings:read:operator",
    "telemetry:read:operator",
  ],
  DRIVER: [
    "trips:read:own",
    "trips:dispatch:own",
    "telemetry:create:own",
    "bookings:read:own",
  ],
  CONDUCTOR: [
    "trips:read:own",
    "bookings:read:own",
    "bookings:checkin:own",
    "seats:lock:counter",
    "bookings:create:counter",
    "bookings:cancel:counter",
    "bookings:print:counter",
    "telemetry:create:own",
  ],
  BOOKIE_COUNTER: [
    "routes:read:all",
    "trips:read:all",
    "seats:lock:counter",
    "bookings:create:counter",
    "bookings:cancel:counter",
    "bookings:print:counter",
    "bookie:read:counter",
  ],
  CUSTOMER: [
    "routes:read:all",
    "trips:read:all",
    "seats:lock:own",
    "bookings:create:own",
    "bookings:read:own",
    "bookings:cancel:own",
  ],
};
