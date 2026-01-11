import mongoose from "mongoose";
import { ServerApiVersion } from "mongodb";
import type { Express } from "express";
import { config } from "./env.js";

export const startServer = async (
  app: Express,
  port: number
): Promise<void> => {
  try {
    await mongoose.connect(config.CONNECTION_STRING, {
      serverSelectionTimeoutMS: 30000, // Set timeout to 30 seconds
      socketTimeoutMS: 45000, // Set socket timeout to 45 seconds
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
      },
    });

    console.log("Connected to MongoDB");

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Application start-up fail", errorMessage);
    process.exit(1);
  }
};
