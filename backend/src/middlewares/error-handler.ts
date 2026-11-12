// @ts-nocheck
import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger.js";

export interface HttpError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
}

export function httpError(status: number, title: string, details?: unknown): HttpError {
  const e = new Error(title) as HttpError;
  e.status = status;
  e.details = details;
  return e;
}

export function errorHandler(err: HttpError | Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    res.status(400).json({
      type: "validation_error",
      status: 400,
      title: "Validation failed",
      issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
    return;
  }
  const status = (err as HttpError).status ?? 500;
  const title = err.message || "Internal Server Error";
  if (status >= 500) logger.error({ err }, title);
  res.status(status).json({ type: "about:blank", status, title, details: (err as HttpError).details });
}
