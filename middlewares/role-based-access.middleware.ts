import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

export const authorizeUser = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req?.user) {
      next(new AppError("Access Denied", 403));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError("Access Denied", 403));
      return;
    }
    next();
  };
};
