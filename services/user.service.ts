import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { UserModel } from "../models/user.model.js";
import { SignInSchema, UserSchema } from "../validators/user.validator.js";
import { AppError } from "../utils/AppError.js";
import { ZodError } from "zod";

export const getUserByEmail = async (email: string) => {
  return await UserModel.findOne({ email: email });
};

export const createUser = async (reqBody: any) => {
  try {
    const body = UserSchema.parse(reqBody);
    
    if (!body || Object.entries(body).length === 0) {
      new AppError("Invalid request.", 400);
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

    return user?._id;
  } catch (error) {
    if (error instanceof ZodError) {
      throw new AppError("Validation failed", 400);
    }

  }
}

export const signInUser =  async (reqBody: any) => {
  try {
    const body = SignInSchema.parse(reqBody);
    const user = await getUserByEmail(body.email);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isPassMatched = await bcrypt.compare(body.password, user.password);
    if (!isPassMatched) {
      new AppError("Invalid credentials", 400)
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

    return signedToken;
  } catch (error) {
    if (error instanceof ZodError) {
      throw new AppError("Validation failed", 400);
    }
    throw error;
  }
}