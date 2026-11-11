import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __yatrasewa_prisma__: PrismaClient | undefined;
}

export const prisma =
  globalThis.__yatrasewa_prisma__ ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__yatrasewa_prisma__ = prisma;
}

export * from "@prisma/client";
