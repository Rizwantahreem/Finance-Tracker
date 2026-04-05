import mongoose from "mongoose";
import { ServerApiVersion } from "mongodb";
import type { Express } from "express";
import { config } from "./env.js";
import { logger } from "../utils/logger.js";

export const startServer = async (
  app: Express,
  port: number
): Promise<void> => {
  try {
    // Build connection options with database name
    const connectionOptions: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 30000, // Set timeout to 30 seconds
      socketTimeoutMS: 45000, // Set socket timeout to 45 seconds
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
      },
    };

    // Always use DB_NAME from config if provided, regardless of connection string
    // This ensures we use the correct database name per environment
    if (config.DB_NAME) {
      // Prevent accidentally using "test" database in non-test environments
      if (config.DB_NAME === 'test' && config.NODE_ENV !== 'test') {
        logger.error({ 
          dbName: config.DB_NAME,
          environment: config.NODE_ENV 
        }, 'ERROR: Cannot use "test" database in non-test environment!');
        throw new Error('Cannot use "test" database in non-test environment. Please set DB_NAME to a different value.');
      }
      
      connectionOptions.dbName = config.DB_NAME;
      logger.info({ 
        dbName: config.DB_NAME,
        environment: config.NODE_ENV,
        connectionString: config.CONNECTION_STRING.replace(/\/\/[^@]+@/, '//***@') // Hide credentials in logs
      }, 'Using explicit database name from configuration');
    } else {
      logger.warn('No DB_NAME configured, using database from connection string or default');
    }

    await mongoose.connect(config.CONNECTION_STRING, connectionOptions);

    // Verify the actual database we're connected to
    const actualDbName = mongoose.connection.db?.databaseName;
    const expectedDbName = config.DB_NAME;
    
    if (actualDbName && expectedDbName && actualDbName !== expectedDbName) {
      logger.warn({ 
        actualDbName,
        expectedDbName,
        environment: config.NODE_ENV 
      }, 'Database name mismatch! Check your connection configuration.');
    }
    
    logger.info({ 
      database: actualDbName || expectedDbName || "default",
      environment: config.NODE_ENV,
      collections: await mongoose.connection.db?.listCollections().toArray().then(cols => cols.map(c => c.name)) || []
    }, `Connected to MongoDB. Database: ${actualDbName || expectedDbName || "default"}`);

    app.listen(port, () => {
      logger.info({ port, environment: config.NODE_ENV }, `Server running on port ${port}`);
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error({ err: `Application start-up fail ${errorMessage}`});
    process.exit(1);
  }
};
