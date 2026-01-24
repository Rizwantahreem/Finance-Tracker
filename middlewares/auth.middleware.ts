import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { config } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { getUserById } from "../services/user.service.js";

interface AuthPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
  name: string;
  age: number;
  tokenVersion?: number;
}

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

  token = token.split(" ")[1] || '';
  try {
    const decodedUser = jwt.verify(token, config.SECRET_KEY) as AuthPayload;
    if (typeof decodedUser === "object" && decodedUser !== null) {
      req.user = decodedUser as Express.Request["user"];
    }
    const userId = String(decodedUser?.id) || '';
    const user = await getUserById(userId)

    if (user?.tokenVersion !== decodedUser?.tokenVersion) {
      next(new AppError("Token expired", 401));
      return;
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
