import type { Request, Response, NextFunction } from "express";
import type { ZodSchema, ZodError } from "zod";

export function validate(schema: ZodSchema, source: "body" | "query" | "params" = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req[source]);
      req[source] = result;
      next();
    } catch (err: any) {
      const issues = (err as ZodError).issues?.map((i) => ({ path: i.path.join("."), message: i.message })) ?? [];
      res.status(400).json({ type: "validation_error", status: 400, title: "Validation failed", issues });
    }
  };
}
