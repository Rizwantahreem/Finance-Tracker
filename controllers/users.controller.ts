import type { Request, Response, NextFunction } from "express";
import { createUser, logOutUser, signInUser } from "../services/user.service.js";
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
    res.cookie("token", signedToken,
      {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge:  5 * 60 * 60 * 1000,
      });
    res.status(200).json({ message: "log in successful" });
  } catch (error) {
    next(error);
  }
};

export const logOut = async(
  req: Request,
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req?.user?.id || '';
    await logOutUser(userId);
    res.json({ message: "successful log out"})
  } catch (error) {
    next(error);
  }
}