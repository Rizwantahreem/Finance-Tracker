import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { beforeAll, afterAll, afterEach } from "vitest";

let mongo: MongoMemoryServer | null = null;

beforeAll(async () => {
  try {
    console.log("Starting MongoMemoryServer...");
    
    // Create MongoMemoryServer - this may download binaries on first run
    mongo = await MongoMemoryServer.create({
      instance: {
        dbName: "test-db",
      },
    });
    
    const uri = mongo.getUri();
    process.env.CONNECTION_STRING = uri;
    console.log("MongoMemoryServer started at:", uri);

    // Connect to MongoDB
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });
    
    console.log("Test database connected successfully");
  } catch (error) {
    console.error("Failed to setup test database:", error);
    if (mongo) {
      await mongo.stop();
    }
    throw error;
  }
}, 120000); // 120 second timeout for first-time MongoDB binary download

afterEach(async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({}))
  );
});

afterAll(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  } catch (error) {
    console.error("Error closing mongoose connection:", error);
  }
  
  try {
    if (mongo) {
      await mongo.stop();
      console.log("MongoMemoryServer stopped");
    }
  } catch (error) {
    console.error("Error stopping MongoMemoryServer:", error);
  }
});
