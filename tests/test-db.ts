import mongoose from "mongoose";

let connectOnce: Promise<void> | null = null;

/** Matches default in global-setup when .env has no CONNECTION_STRING */
const PLACEHOLDER_CONNECTION =
  "mongodb://localhost:27017/test-temp";

/** Atlas (or any remote) DB used only for tests — never your dev data */
const TEST_DB_NAME =
  process.env.TEST_DB_NAME?.trim() || "finance-tracker-test";

/**
 * TEST_MONGODB_URI overrides; otherwise same CONNECTION_STRING as the app (.env).
 * Always connects with dbName TEST_DB_NAME.
 */
function resolveMongoUriForTests(): string | null {
  const explicit = process.env.TEST_MONGODB_URI?.trim();
  if (explicit) {
    return explicit;
  }

  const fromEnv = process.env.CONNECTION_STRING?.trim();
  if (fromEnv && fromEnv !== PLACEHOLDER_CONNECTION) {
    return fromEnv;
  }

  return null;
}

/** Single shared connection for the whole Vitest run (singleFork). */
export async function connectSharedTestDb(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  if (connectOnce) {
    return connectOnce;
  }

  connectOnce = (async () => {
    const uri = resolveMongoUriForTests();

    if (!uri) {
      throw new Error(
        `Tests need MongoDB Atlas (or a remote URI). Add CONNECTION_STRING to .env (same as \`npm run dev\`). ` +
          `Tests use database "${TEST_DB_NAME}" only. Optional: TEST_MONGODB_URI for a different URI.`
      );
    }

    process.env.CONNECTION_STRING = uri;
    const source = process.env.TEST_MONGODB_URI?.trim()
      ? "TEST_MONGODB_URI"
      : "CONNECTION_STRING (.env)";

    console.log(
      `Tests: ${source} → database "${TEST_DB_NAME}" (Atlas / remote only).`
    );

    await mongoose.connect(uri, {
      dbName: TEST_DB_NAME,
      serverSelectionTimeoutMS: 30_000,
      connectTimeoutMS: 30_000,
      readPreference: "primary",
    });

    console.log("Test database connected successfully");
  })();

  try {
    await connectOnce;
  } catch (e) {
    connectOnce = null;
    throw e;
  }
}
