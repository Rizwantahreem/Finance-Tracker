import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().transform(Number),
  CONNECTION_STRING: z.string(),
  DB_NAME: z.string().optional(),
  SECRET_KEY: z.string(),
  DB_USER: z.string().optional(),
  DB_USER_PASSWORD: z.string().optional(),
  ENC_ALGO: z.string(),
  CORS_ORIGIN: z.string(),
  NODE_ENV: z.enum(["development", "test", "production", "staging"]).default("development"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).optional(),
});

const parsed = envSchema.safeParse(process.env);

let config: z.infer<typeof envSchema>;

  if (!parsed.success) {
    // In test mode, be more lenient - don't exit process
    if (process.env.NODE_ENV === "test") {
      console.warn("Test mode: Some environment variables may be missing, using defaults");
      // Provide defaults for test mode
      config = {
        PORT: Number(process.env.PORT || "0"),
        CONNECTION_STRING: process.env.CONNECTION_STRING || "mongodb://localhost:27017/test",
        DB_NAME: process.env.DB_NAME || "finance-tracker-test",
        SECRET_KEY: process.env.SECRET_KEY || "test-secret-key",
        DB_USER: process.env.DB_USER || "test-user",
        DB_USER_PASSWORD: process.env.DB_USER_PASSWORD || "test-password",
        ENC_ALGO: process.env.ENC_ALGO || "HS256",
        CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:4200",
        NODE_ENV: process.env.NODE_ENV ?? "development",
        LOG_LEVEL: (process.env.LOG_LEVEL as any) || "info"
      };
    } else {
      console.error("Invalid environment variables");
      console.error(parsed.error.format());
      process.exit(1);
    }
  } else {
    config = parsed.data;
    // Set default DB_NAME based on NODE_ENV if not provided
    if (!config.DB_NAME) {
      const envDbNames: Record<string, string> = {
        development: "finance-tracker-dev",
        staging: "finance-tracker-staging",
        production: "finance-tracker-prod",
        test: "finance-tracker-test"
      };
      config.DB_NAME = envDbNames[config.NODE_ENV] || "finance-tracker";
    }
  }

export { config };
