import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

export const errorLogger = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {  
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    logger.warn({
      requestId: req.requestId,
      path: req.originalUrl,
      method: req.method,
      errors: error.message,
    }, "Validation error");
    
    res.status(400).json({
      message: "Validation error",
      errors: error.message,
    });
    return;
  }

  // Handle AppError (operational errors)
  if (error instanceof AppError && error.isOperational) {
    logger.warn({
      requestId: req.requestId,
      userId: req.user?.id,
      path: req.originalUrl,
      method: req.method,
      statusCode: error.statusCode,
      message: error.message,
    }, "Operational error");
    
    res.status(error.statusCode).json({
      message: error.message,
    });
    return;
  }

  // Handle JWT errors
  if (error && typeof error === "object" && "name" in error) {
    if (error.name === "JsonWebTokenError") {
      logger.warn({
        requestId: req.requestId,
        path: req.originalUrl,
        method: req.method,
      }, "Invalid JWT token");
      
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    if (error.name === "TokenExpiredError") {
      logger.warn({
        requestId: req.requestId,
        path: req.originalUrl,
        method: req.method,
      }, "Expired JWT token");
      
      res.status(401).json({ message: "Token expired" });
      return;
    }
  }

  // Handle unexpected/programming errors
  logger.error({
    requestId: req.requestId,
    path: req.originalUrl,
    method: req.method,
    userId: req.user?.id,
    name: error.name,
    message: error.message,
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
  }, "Unexpected error");

  res.status(500).json({
    message: "Internal server error",
    ...(process.env.NODE_ENV !== "production" && {
      error: error.message,
    }),
  });
};
