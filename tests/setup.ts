import mongoose from "mongoose";
import { afterEach, beforeAll } from "vitest";
import { connectSharedTestDb } from "./test-db.js";

beforeAll(async () => {
  await connectSharedTestDb();
}, 45_000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({}))
  );
});
