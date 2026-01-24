import request from "supertest";
import { app } from "../app.js";
import { UserModel } from "../models/user.model.js";
import { describe, expect, it } from "vitest";

describe("Auth & Users API", () => {
  const basePath = "/api/user";

  const validUser = {
    name: "Test User",
    email: "testuser@example.com",
    password: "password123",
    age: "30",
    role: "user",
    phoneNumber: "1234567890",
  };

  it("should sign up a new user successfully", async () => {
    const res = await request(app).post(`${basePath}/sign-up`).send(validUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/user with id .* created\./i);

    const userInDb = await UserModel.findOne({ email: validUser.email });
    expect(userInDb).not.toBeNull();
    expect(userInDb?.email).toBe(validUser.email);
  });

  it("should not allow duplicate email sign-up", async () => {
    // First signup
    await request(app).post(`${basePath}/sign-up`).send(validUser);

    // Second signup with same email should fail due to unique index
    const res = await request(app).post(`${basePath}/sign-up`).send(validUser);

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body).toHaveProperty("message");
  });

  it("should fail signup with invalid body", async () => {
    const res = await request(app)
      .post(`${basePath}/sign-up`)
      .send({ email: "bad", password: "123" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Validation failed");
  });

  it("should log in an existing user and set cookie", async () => {
    // Ensure user exists
    await request(app).post(`${basePath}/sign-up`).send(validUser);

    const res = await request(app)
      .post(`${basePath}/log-in`)
      .send({ email: validUser.email, password: validUser.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("log in successful");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should reject login for non-existing user", async () => {
    const res = await request(app)
      .post(`${basePath}/log-in`)
      .send({ email: "nouser@example.com", password: "password123" });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User not found");
  });
});

