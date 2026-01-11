import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";

export const errorLogger = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Validation error",
      errors: error.message,
    });
    return;
  }

  // Handle AppError
  if (error instanceof AppError && error.isOperational) {
    res.status(error.statusCode).json({
      message: error.message,
    });
    return;
  }

  // Handle JWT errors
  if (error && typeof error === "object" && "name" in error) {
    if (error.name === "JsonWebTokenError") {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    if (error.name === "TokenExpiredError") {
      res.status(401).json({ message: "Token expired" });
      return;
    }
  }

  // Unknown errors
  console.error("Error:", error);
  res.status(500).json({
    message: "Internal server error",
  });
};
