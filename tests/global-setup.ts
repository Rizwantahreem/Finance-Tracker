// This runs BEFORE any test files are loaded
// Set all required environment variables here
process.env.NODE_ENV = "test";
process.env.SECRET_KEY = process.env.SECRET_KEY || "test-secret-key";
process.env.ENC_ALGO = process.env.ENC_ALGO || "HS256";
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:4200";
process.env.PORT = process.env.PORT || "0";
process.env.DB_USER = process.env.DB_USER || "test-user";
process.env.DB_USER_PASSWORD = process.env.DB_USER_PASSWORD || "test-password";
// Temporary connection string - will be replaced in setup.ts
process.env.CONNECTION_STRING = process.env.CONNECTION_STRING || "mongodb://localhost:27017/test-temp";

export default async () => {
  // Global setup if needed
};
