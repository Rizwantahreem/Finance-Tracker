import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { config } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined =
    (req.headers.authorization as string | undefined) ||
    (req.headers.Authorization as string | undefined);

  if (!token || !token?.startsWith("Bearer ")) {
    next(new AppError("Unauthorized access.", 401));
    return;
  }

  token = token.split(" ")[1];
  try {
    const decodedUser = jwt.verify(token, config.SECRET_KEY);
    if (typeof decodedUser === "object" && decodedUser !== null) {
      req.user = decodedUser as Express.Request["user"];
    }
    next();
  } catch (error) {
    if (error && typeof error === "object" && "name" in error) {
      if (error.name === "TokenExpiredError") {
        next(new AppError("Token expired", 401));
        return;
      }
    }
    next(new AppError("Invalid token", 401));
  }
};
