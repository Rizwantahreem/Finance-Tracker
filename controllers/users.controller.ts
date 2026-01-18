import type { Request, Response, NextFunction } from "express";
import { createUser, signInUser } from "../services/user.service.js";
import { AppError } from "../utils/AppError.js";
import { ZodError } from "zod";

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = await createUser(req?.body)
    res.status(201).json({ message: `user with id ${id} created.` });
  } catch (error) {
    next(error);
  }
};

export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    
    const signedToken = await signInUser(req?.body);

    res.status(200).json({ message: "log in successful" });
  } catch (error) {
    if (error instanceof ZodError) {
      next(new AppError("Validation failed", 400));
      return;
    }
    next(error);
  }
};
