import { randomUUID } from "crypto";
import type { Request, Response, NextFunction } from "express";

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.requestId = randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  next();
};
