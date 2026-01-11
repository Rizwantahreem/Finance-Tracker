import mongoose from "mongoose";
import { MongoClient, ServerApiVersion } from "mongodb";
import { config } from "./env.js";

const client = new MongoClient(config.CONNECTION_STRING, {
  serverSelectionTimeoutMS: 30000, // Set timeout to 30 seconds
  socketTimeoutMS: 45000, // Set socket timeout to 45 seconds
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
  },
});

export const startServer = async (app, port) => {
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
    console.error("Application start-up fail", error.message);
    process.exit(1);
  }
};
