import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import { app } from "../app.js";
import { UserModel } from "../models/user.model.js";
import { CategoryModel } from "../models/category.model.js";
import { TransactionModel } from "../models/transaction.model.js";
import { config } from "../config/env.js";
import { describe, expect, it } from "vitest";

describe("Transactions API & Service", () => {
  const basePath = "/api/transaction";

  const createAuthUserAndToken = async (role: string = "user") => {
    const user = await UserModel.create({
      name: "Tx User",
      email: `${new mongoose.Types.ObjectId().toString()}@example.com`,
      password: "hashed-password",
      age: 30,
      role,
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

  const createCategory = async (userId: mongoose.Types.ObjectId | null = null) => {
    const category = await CategoryModel.create({
      name: "Food",
      type: "expense",
      userId,
      description: "Food expenses",
    });
    return category;
  };

  it("should reject access without Authorization header", async () => {
    const res = await request(app).get(`${basePath}/`);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized access.");
  });

  it("should create a new transaction successfully", async () => {
    const { user, token } = await createAuthUserAndToken();
    const category = await createCategory(user._id);

    const body = {
      amount: 100,
      description: "Grocery shopping",
      type: "expense",
      categoryId: category._id.toString(),
      transactionDate: new Date().toISOString(),
    };

    const res = await request(app)
      .post(`${basePath}/`)
      .set("Authorization", `Bearer ${token}`)
      .send(body);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/transaction with id .* created successfully/i);

    const tx = await TransactionModel.findOne({ userId: user._id });
    expect(tx).not.toBeNull();
    expect(tx?.amount).toBe(100);
  });

  it("should get paginated transactions", async () => {
    const { user, token } = await createAuthUserAndToken();
    const category = await createCategory(user._id);

    const baseTx = {
      amount: 50,
      description: "Tx",
      type: "expense",
      category: category._id,
      userId: user._id,
      transactionDate: new Date(),
      isDeleted: false,
    };
    await TransactionModel.insertMany([
      baseTx,
      { ...baseTx, amount: 60 },
      { ...baseTx, amount: 70 },
    ]);

    const res = await request(app)
      .get(`${basePath}/pageNo/1/limit/2`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.transactions.length).toBeLessThanOrEqual(2);
    expect(typeof res.body.totalRecords).toBe("number");
  });

  it("should soft delete a transaction", async () => {
    const { user, token } = await createAuthUserAndToken();
    const category = await createCategory(user._id);

    const tx = await TransactionModel.create({
      amount: 200,
      description: "To delete",
      type: "expense",
      category: category._id,
      userId: user._id,
      transactionDate: new Date(),
      isDeleted: false,
    });

    const res = await request(app)
      .delete(`${basePath}/${tx._id.toString()}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);

    const updated = await TransactionModel.findById(tx._id);
    expect(updated?.isDeleted).toBe(true);
  });

  it("should update a transaction", async () => {
    const { user, token } = await createAuthUserAndToken();
    const category = await createCategory(user._id);

    const tx = await TransactionModel.create({
      amount: 80,
      description: "To update",
      type: "expense",
      category: category._id,
      userId: user._id,
      transactionDate: new Date(),
      isDeleted: false,
    });

    const res = await request(app)
      .patch(`${basePath}/${tx._id.toString()}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 120 });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/updated\./i);

    const updated = await TransactionModel.findById(tx._id);
    expect(updated?.amount).toBe(120);
  });
});

