import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import { app } from "../app.js";
import { UserModel } from "../models/user.model.js";
import { CategoryModel } from "../models/category.model.js";
import { BudgetModel } from "../models/budget.model.js";
import { config } from "../config/env.js";
import { describe, expect, it } from "vitest";

describe("Budgets & Categories API", () => {
  const budgetBase = "/api/budget";
  const categoryBase = "/api/category";

  const createAuthUserAndToken = async () => {
    const user = await UserModel.create({
      name: "Budget User",
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

  it("should create and fetch custom categories", async () => {
    const { user, token } = await createAuthUserAndToken();

    const body = {
      name: "Travel",
      type: "expense",
      description: "Travel expenses",
    };

    const createRes = await request(app)
      .post(`${categoryBase}/`)
      .set("Authorization", `Bearer ${token}`)
      .send(body);

    expect(createRes.statusCode).toBe(201);
    expect(createRes.body.message).toMatch(/Category with id .* created/i);

    const listRes = await request(app)
      .get(`${categoryBase}/isCustom/true/pageNo/1/limit/10`)
      .set("Authorization", `Bearer ${token}`);

    expect(listRes.statusCode).toBe(200);
    expect(Array.isArray(listRes.body.categories)).toBe(true);
    expect(typeof listRes.body.totalRecord).toBe("number");
  });

  it("should create, update, list and soft delete a budget", async () => {
    const { user, token } = await createAuthUserAndToken();

    const category = await CategoryModel.create({
      name: "Rent",
      type: "expense",
      userId: user._id,
      description: "Monthly rent",
    });

    const createRes = await request(app)
      .post(`${budgetBase}/`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        budgetAmount: 1000,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        category: category._id.toString(),
      });

    expect(createRes.statusCode).toBe(201);
    expect(createRes.body.message).toMatch(/Budget with id .* created\./i);

    const budgetId = createRes.body.message.match(/id ([a-f0-9]+) created\./i)?.[1];
    expect(budgetId).toBeDefined();

    const listRes = await request(app)
      .get(`${budgetBase}/pageNo/1/limit/10`)
      .set("Authorization", `Bearer ${token}`);

    expect(listRes.statusCode).toBe(200);
    expect(Array.isArray(listRes.body.budget)).toBe(true);

    const updateRes = await request(app)
      .patch(`${budgetBase}/${budgetId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ budgetAmount: 1200 });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.message).toMatch(/updated\./i);

    const deleteRes = await request(app)
      .delete(`${budgetBase}/${budgetId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.message).toMatch(/deleted\./i);

    const budget = await BudgetModel.findById(budgetId);
    expect(budget?.isDeleted).toBe(true);
  });
});

