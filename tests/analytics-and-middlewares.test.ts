import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import { app } from "../app.js";
import { UserModel } from "../models/user.model.js";
import { CategoryModel } from "../models/category.model.js";
import { TransactionModel } from "../models/transaction.model.js";
import { getStartOfMonth, getEndOfMonth } from "../utils/date.util.js";
import { authorizeUser } from "../middlewares/role-based-access.middleware.js";
import { AppError } from "../utils/AppError.js";
import { config } from "../config/env.js";
import { describe, expect, it } from "vitest";

describe("Dashboard analytics endpoints", () => {
  const basePath = "/api/dashboard";

  const createAuthUserAndToken = async () => {
    const user = await UserModel.create({
      name: "Analytics User",
      email: `${new mongoose.Types.ObjectId().toString()}@example.com`,
      password: "hashed-password",
      age: 30,
      role: "user",
      phoneNumber: "1234567890",
      isEmailVerified: true,
    });

    const token = jwt.sign(
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

    return { user, token };
  };

  it("should return dashboard summary for current month", async () => {
    const { user, token } = await createAuthUserAndToken();

    const category = await CategoryModel.create({
      name: "Salary",
      type: "saving",
      userId: user._id,
      description: "Monthly salary",
    });

    await TransactionModel.create({
      amount: 5000,
      description: "Salary",
      type: "saving",
      category: category._id,
      userId: user._id,
      transactionDate: new Date(),
      isDeleted: false,
    });

    const res = await request(app)
      .get(`${basePath}/summary`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.summary).toBeDefined();
    expect(res.body.summary.totalSavings).toBeGreaterThanOrEqual(0);
  });

  it("should return recent transactions", async () => {
    const { user, token } = await createAuthUserAndToken();

    const category = await CategoryModel.create({
      name: "Groceries",
      type: "expense",
      userId: user._id,
      description: "Groceries",
    });

    await TransactionModel.insertMany([
      {
        amount: 100,
        description: "Grocery 1",
        type: "expense",
        category: category._id,
        userId: user._id,
        transactionDate: new Date(),
        isDeleted: false,
      },
      {
        amount: 150,
        description: "Grocery 2",
        type: "expense",
        category: category._id,
        userId: user._id,
        transactionDate: new Date(),
        isDeleted: false,
      },
    ]);

    const res = await request(app)
      .get(`${basePath}/recent-transactions`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.transactions)).toBe(true);
  });
});

describe("Utils & middlewares", () => {
  it("getStartOfMonth and getEndOfMonth should bound the month correctly", () => {
    const now = new Date(2025, 4, 15, 10, 30, 0); // May 15, 2025
    const start = getStartOfMonth(now);
    const end = getEndOfMonth(now);

    expect(start.getDate()).toBe(1);
    expect(start.getMonth()).toBe(4);

    expect(end.getMonth()).toBe(4);
    expect(end.getDate()).toBeGreaterThanOrEqual(28);
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
    expect(end.getSeconds()).toBe(59);
  });

  it("authorizeUser should throw AppError for missing user", () => {
    const middleware = authorizeUser("admin");

    const req: any = {};
    const res: any = {};
    let capturedError: Error | null = null;

    const next = (err?: Error) => {
      capturedError = err ?? null;
    };

    // Patch: next's argument must be compatible with express's NextFunction,
    // whose signature is (err?: any) => void, but test also expects instance of AppError.
    // So, typing to (err?: any) to satisfy type check.
    middleware(req, res, next as import('express').NextFunction);

    expect(capturedError).toBeInstanceOf(AppError);
    expect((capturedError as unknown as AppError).statusCode).toBe(403);
  });

  it("authorizeUser should allow when role is permitted", () => {
    const middleware = authorizeUser("admin", "user");

    const req: any = { user: { role: "user" } };
    const res: any = {};
    let calledNextWithoutError = false;

    const next = (err?: Error) => {
      if (!err) {
        calledNextWithoutError = true;
      }
    };

    middleware(req, res, next as import('express').NextFunction);

    expect(calledNextWithoutError).toBe(true);
  });
});

