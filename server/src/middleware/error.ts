import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "ValidationError",
      details: err.flatten(),
    });
  }

  // Mongo duplicate key
  if (err && typeof err === "object" && "code" in err && (err as { code?: number }).code === 11000) {
    const keyValue = (err as { keyValue?: Record<string, unknown> }).keyValue;
    return res.status(409).json({ error: "DuplicateKey", keyValue: keyValue || null });
  }

  if (err && typeof err === "object" && "name" in err && err.name === "CastError") {
    return res.status(400).json({ error: "InvalidId" });
  }

  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({ error: "InternalServerError" });
}
