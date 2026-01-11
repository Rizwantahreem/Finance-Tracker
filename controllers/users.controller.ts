import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { UserModel } from "../models/user.model.js";
import { getUserByEmail } from "../services/user.service.js";
import { SignInSchema, UserSchema } from "../validators/user.validator.js";
import { config } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { ZodError } from "zod";

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = UserSchema.parse(req.body);

    if (!body || Object.entries(body).length === 0) {
      next(new AppError("Invalid request.", 400));
      return;
    }

    const encryptedPassword = await bcrypt.hash(body.password, 12);
    const user = await UserModel.create({
      name: body.name,
      password: encryptedPassword,
      age: body.age,
      email: body.email,
      role: body.role,
      phoneNumber: body?.phoneNumber || null,
    });

    res.status(201).json({ message: `user with id ${user._id} created.` });
  } catch (error) {
    console.error(error);
    if (error instanceof ZodError) {
      next(new AppError("Validation failed", 400));
      return;
    }

    next(error);
  }
};

export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = SignInSchema.parse(req.body);
    const user = await getUserByEmail(body.email);

    if (!user) {
      next(new AppError("User not found", 404));
      return;
    }

    const isPassMatched = await bcrypt.compare(body.password, user.password);
    if (!isPassMatched) {
      next(new AppError("Invalid credentials", 400));
      return;
    }

    const signedToken = jwt.sign(
      {
        email: user.email,
        age: user.age,
        name: user.name,
        role: user.role,
        id: user._id.toString(),
      },
      config.SECRET_KEY,
      {
        expiresIn: "5h",
        algorithm: config.ENC_ALGO as jwt.Algorithm,
      }
    );

    res.cookie("token", signedToken, {
      httpOnly: true,
      sameSite: "strict", // CSRF protection
      maxAge: 5 * 60 * 60 * 1000,
    });
    res.status(200).json({ message: "log in successful" });
  } catch (error) {
    if (error instanceof ZodError) {
      next(new AppError("Validation failed", 400));
      return;
    }
    next(error);
  }
};
