import { JwtPayload } from "jsonwebtoken";
import { Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        id: string;
        email: string;
        role: string;
        name: string;
        age: number;
      };
    }
  }
}

export {};
