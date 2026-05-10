# Environment Setup & Configuration Guide

**Date:** January 25, 2026  
**Purpose:** Comprehensive guide for understanding environment configuration, MongoDB database setup, and Docker deployment

---

## Table of Contents

1. [Understanding the Problem](#understanding-the-problem)
2. [Environment Configuration System](#environment-configuration-system)
3. [MongoDB Database Configuration](#mongodb-database-configuration)
4. [Docker Deployment](#docker-deployment)
5. [Key Changes Made](#key-changes-made)
6. [Best Practices for Portfolio Projects](#best-practices-for-portfolio-projects)
7. [Troubleshooting](#troubleshooting)

---

## Understanding the Problem

### The Issue: Data Going to "test" Database

**Problem:** When connecting to MongoDB Atlas, all data was being stored in a database named "test" instead of your intended database.

**Root Cause:**
- MongoDB connection strings from Atlas don't always specify a database name
- When no database name is provided, MongoDB defaults to "test"
- The application wasn't explicitly setting which database to use

**Solution:**
- Added `DB_NAME` environment variable
- Updated connection logic to use the specified database name
- Implemented environment-based default database names

---

## Environment Configuration System

### Overview

The application now supports multiple environments with proper configuration management:

- **Development** (`NODE_ENV=development`)
- **Staging** (`NODE_ENV=staging`)
- **Production** (`NODE_ENV=production`)
- **Test** (`NODE_ENV=test`)

### Environment Variables

#### Required Variables

```env
PORT=8000                          # Server port
CONNECTION_STRING=...              # MongoDB Atlas connection string
SECRET_KEY=...                     # JWT secret key
ENC_ALGO=HS256                     # JWT encryption algorithm
CORS_ORIGIN=http://localhost:3000  # Allowed CORS origins
NODE_ENV=development               # Environment name
```

#### Optional Variables

```env
DB_NAME=finance-tracker-dev         # Database name (auto-set if not provided)
DB_USER=...                        # DB username (if not in connection string)
DB_USER_PASSWORD=...               # DB password (if not in connection string)
LOG_LEVEL=info                     # Logging level (fatal, error, warn, info, debug, trace)
```

### How It Works

1. **Validation with Zod**: All environment variables are validated using Zod schemas
2. **Type Safety**: Configuration is fully typed with TypeScript
3. **Default Values**: Environment-specific defaults are applied automatically
4. **Error Handling**: Invalid configurations cause the app to exit early with clear error messages

### Code Location: `config/env.ts`

```typescript
// Environment schema definition
const envSchema = z.object({
  PORT: z.string().transform(Number),
  CONNECTION_STRING: z.string(),
  DB_NAME: z.string().optional(),
  // ... other variables
  NODE_ENV: z.enum(["development", "test", "production", "staging"]),
});

// Automatic database name assignment based on environment
if (!config.DB_NAME) {
  const envDbNames = {
    development: "finance-tracker-dev",
    staging: "finance-tracker-staging",
    production: "finance-tracker-prod",
    test: "finance-tracker-test"
  };
  config.DB_NAME = envDbNames[config.NODE_ENV] || "finance-tracker";
}
```

**Key Learning Points:**
- ✅ **Type Safety**: Using Zod ensures runtime validation matches TypeScript types
- ✅ **Fail Fast**: Invalid configs are caught at startup, not during runtime
- ✅ **Environment Awareness**: Different defaults for different environments
- ✅ **Developer Experience**: Clear error messages when configuration is wrong

---

## MongoDB Database Configuration

### Connection String Format

MongoDB Atlas connection strings typically look like:

```
mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

**Note:** The database name is NOT in the connection string by default.

### How Database Name is Determined

The application uses a smart fallback system:

1. **If `DB_NAME` is set**: Use that value
2. **If connection string has a database**: Use the one in the connection string
3. **Otherwise**: Use environment-based default

### Code Location: `config/DbConnection.ts`

When `DB_NAME` is set (either explicitly or via `config/env.ts` defaults), it is passed as `mongoose` connect options (`dbName`). Startup logs include **db name**, **environment**, and a **redacted** connection string (`user:password@` replaced by `***@`) — `SECRET_KEY` is never logged.

```typescript
if (config.DB_NAME) {
  connectionOptions.dbName = config.DB_NAME;
  logger.info({
    dbName: config.DB_NAME,
    environment: config.NODE_ENV,
    connectionString: config.CONNECTION_STRING.replace(/\/\/[^@]+@/, "//***@"),
  }, "Using explicit database name from configuration");
}
await mongoose.connect(config.CONNECTION_STRING, connectionOptions);
```

**Key Learning Points:**
- ✅ **Explicit Control**: `DB_NAME` selects the MongoDB database regardless of path in the URI
- ✅ **Environment Isolation**: Different databases for dev/staging/prod
- ✅ **Logging**: Confirms database and environment without leaking URI credentials

### Setting Up MongoDB Atlas

1. **Create Cluster**: Set up a MongoDB Atlas cluster
2. **Get Connection String**: Copy the connection string from Atlas dashboard
3. **Set Database Name**: Add `DB_NAME` to your `.env` file
4. **Test Connection**: Check logs to verify which database is being used

**Example `.env` for Development:**
```env
CONNECTION_STRING=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=finance-tracker-dev
NODE_ENV=development
```

**Example `.env` for Production:**
```env
CONNECTION_STRING=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=finance-tracker-prod
NODE_ENV=production
```

---

## Docker Deployment

### Why Docker?

Docker provides:
- ✅ **Consistency**: Same environment across dev/staging/prod
- ✅ **Isolation**: Separate containers for different environments
- ✅ **Portability**: Run anywhere Docker is installed
- ✅ **Scalability**: Easy to scale horizontally

### Multi-Stage Dockerfile

The Dockerfile uses a **multi-stage build** pattern:

**Stage 1: Builder**
- Installs all dependencies (including dev dependencies)
- Compiles TypeScript to JavaScript
- Creates optimized production build

**Stage 2: Production**
- Only includes production dependencies
- Smaller image size
- Runs as non-root user for security

### Key Docker Features

1. **Security**: Non-root user execution
2. **Health Checks**: Built-in health check endpoint
3. **Optimization**: Multi-stage build reduces image size
4. **Best Practices**: Proper layer caching, minimal dependencies

### Docker Compose Setup

There are **two** Compose files:

| File | Service name | Port | Env file loaded into container |
|------|----------------|------|--------------------------------|
| `docker-compose.yml` | `finance-tracker-dev` | `8000:8000` | `.env` |
| `docker-compose.staging.yml` | `finance-tracker-staging` | `8000:8000` | `.env.staging` |

Both use the same `Dockerfile` (`target: production`), set `DB_NAME` per stack, and define a `healthcheck` against `/healthz`.

**Staging / Compose variables:** `docker-compose.staging.yml` sets `environment: CONNECTION_STRING: ${CONNECTION_STRING}` (and the other required keys) so values are injected at container create time. Compose resolves `${…}` from the project **`.env`** (auto-loaded) and/or from **`docker compose --env-file .env.staging`**. Relying only on a service `env_file:` without matching `environment:` entries can leave `process.env` empty in some setups; `npm run docker:staging` uses `--env-file .env.staging` so interpolation matches your staging file.

**Valid YAML:** Under `services:`, every key must be a real service name. Use `# Comment` for section labels; a line like `Staging environment:` is invalid and fails schema validation.

### Running with Docker

**Build the image:**
```bash
npm run docker:build
# or
docker build -t finance-tracker .
```

**Run development:**
```bash
npm run docker:dev
# or
docker compose up finance-tracker-dev
```

**Run staging:**
```bash
docker compose -f docker-compose.staging.yml build
npm run docker:staging
# or (variables from project .env only)
docker compose -f docker-compose.staging.yml up finance-tracker-staging
# or (variables from .env.staging only)
docker compose -f docker-compose.staging.yml --env-file .env.staging up finance-tracker-staging
```

**Stop containers:**
```bash
npm run docker:down                    # default project (dev compose file)
npm run docker:staging:down            # staging project
```

### Environment Files for Docker

- **`.env`** — Used with `docker-compose.yml` (development).
- **`.env.staging`** — Use with `docker compose --env-file .env.staging` (or `npm run docker:staging`) so `${CONNECTION_STRING}` and other keys in the compose file resolve. Same variable names as `.env`. To share one MongoDB database with dev, reuse the same `CONNECTION_STRING` and `DB_NAME`.

Do not commit real `.env`, `.env.staging`, or `.env.production` files.

### Secrets and operational hygiene

- The Node app does **not** log JWT secrets; Mongo URIs in logs are **redacted** in `DbConnection.ts`.
- **`docker compose config`** prints the fully interpolated file and can expose secrets — do not paste that output into tickets or chat.

---

## Key Changes Made

### 1. Environment Configuration (`config/env.ts`)

**Before:**
- No `DB_NAME` variable
- Limited environment support
- No automatic defaults

**After:**
- ✅ `DB_NAME` environment variable
- ✅ Support for dev/staging/prod/test
- ✅ Automatic database name based on environment
- ✅ `LOG_LEVEL` configuration
- ✅ Better error messages

### 2. Database Connection (`config/DbConnection.ts`)

**Before:**
- Direct connection without database name specification
- No logging of which database is used

**After:**
- ✅ Smart database name detection
- ✅ Explicit database name setting
- ✅ Structured logging with database name
- ✅ Better error handling

### 3. Logging System (`utils/logger.ts`)

**Before:**
- Basic Pino logger
- No environment-specific configuration

**After:**
- ✅ Pretty printing in development
- ✅ JSON output in production
- ✅ Environment-aware log levels
- ✅ Structured logging with context

### 4. Error Handling (`middlewares/error.middleware.ts`)

**Before:**
- Duplicate error handling logic
- No structured logging
- Missing request context

**After:**
- ✅ Removed duplicate checks
- ✅ Structured error logging
- ✅ Request ID in all error logs
- ✅ Better error categorization

### 5. Application Setup (`app.ts`)

**Before:**
- Missing request ID middleware
- Incorrect middleware order
- No health check endpoints

**After:**
- ✅ Request ID middleware (first)
- ✅ HTTP logging middleware
- ✅ Health check endpoints (`/healthz`, `/readyz`)
- ✅ Proper middleware ordering

### 6. Security Improvements

**Cookie Security (`controllers/users.controller.ts`):**
- ✅ `secure: false` → `secure: process.env.NODE_ENV === "production"`
- ✅ Cookies are secure in production (HTTPS required)

### 7. Docker Support

**Files:**
- ✅ `Dockerfile` — Multi-stage production build
- ✅ `.dockerignore` — Optimize build context
- ✅ `docker-compose.yml` — Development stack
- ✅ `docker-compose.staging.yml` — Staging stack

### 8. Build Process (`package.json`)

**Scripts (subset):**
- ✅ `build` — Compile TypeScript
- ✅ `start` / `start:prod` — Run compiled server
- ✅ `docker:build`, `docker:dev`, `docker:staging`, `docker:staging:down`, `docker:down`

---

## Best Practices for Portfolio Projects

### What Makes This Portfolio-Worthy?

#### 1. **Production-Ready Configuration**
- ✅ Environment-based configuration
- ✅ Type-safe environment variables
- ✅ Proper error handling
- ✅ Health check endpoints

#### 2. **Docker Deployment**
- ✅ Multi-stage builds
- ✅ Security best practices (non-root user)
- ✅ Health checks
- ✅ Multi-environment support

#### 3. **Observability**
- ✅ Structured logging
- ✅ Request ID tracking
- ✅ Health check endpoints
- ✅ Environment-aware logging

#### 4. **Code Quality**
- ✅ TypeScript strict mode
- ✅ Proper error handling
- ✅ Middleware organization
- ✅ Separation of concerns

### Areas That Show Senior-Level Skills

1. **Environment Management**: Proper multi-environment setup
2. **Docker Expertise**: Multi-stage builds, security, health checks
3. **Observability**: Structured logging, request tracking
4. **Type Safety**: Zod validation with TypeScript
5. **Security**: Environment-aware cookie settings, non-root Docker user

### Next Steps for Portfolio Enhancement

1. **Add Database Indexes**: Improve query performance
2. **Add API Versioning**: `/api/v1/...` endpoints
3. **Add Metrics**: Prometheus metrics endpoint
4. **Add Tests**: Increase test coverage
5. **Add CI/CD**: GitHub Actions for automated testing/deployment
6. **Add API Documentation**: OpenAPI/Swagger specification

---

## Troubleshooting

### Issue: Still connecting to "test" database

**Solution:**
1. Check your `.env` file has `DB_NAME` set
2. Verify `NODE_ENV` is set correctly
3. Check application logs on startup - it will show which database is connected
4. Ensure your MongoDB Atlas connection string doesn't already specify a database name

### Issue: Docker container won't start

**Solution:**
1. Check environment variables are set (`.env` for dev; `.env.staging` plus staging interpolation vars for staging)
2. Verify MongoDB connection string is correct
3. Check Docker logs: `docker logs finance-tracker-dev` or `docker logs finance-tracker-staging`
4. Ensure port `8000` is not already in use on the host
5. If Compose reports `additional properties ... not allowed` under `services`, remove stray pseudo-headings and use `# comments` only

### Issue: Health check failing

**Solution:**
1. Verify `/healthz` endpoint returns 200
2. Check `/readyz` endpoint - it requires database connection
3. Ensure database connection is successful
4. Check application logs for connection errors

### Issue: Cookies not working in production

**Solution:**
1. Ensure `NODE_ENV=production` is set
2. Verify HTTPS is enabled (required for secure cookies)
3. Check CORS configuration allows credentials
4. Verify cookie settings in browser dev tools

---

## Summary

### Key Takeaways

1. **Environment Configuration**: Use Zod for type-safe, validated configuration
2. **Database Names**: Always explicitly set database names per environment
3. **Docker**: Multi-stage builds and proper security practices
4. **Logging**: Structured logging with environment-aware configuration
5. **Health Checks**: Essential for production deployments
6. **Security**: Environment-aware security settings

### What You've Learned

- ✅ How to configure multiple environments properly
- ✅ How to fix MongoDB database name issues
- ✅ How to set up Docker for production deployment
- ✅ How to implement structured logging
- ✅ How to add health check endpoints
- ✅ How to improve error handling
- ✅ How to make security settings environment-aware

### Portfolio Impact

These changes demonstrate:
- **Senior-level thinking**: Environment management, Docker expertise
- **Production awareness**: Health checks, structured logging, security
- **Best practices**: Type safety, error handling, code organization
- **DevOps skills**: Docker, multi-environment deployment

---

**Remember**: A portfolio project that shows production-ready practices, proper environment management, and deployment knowledge stands out significantly more than a project that "just works" locally.

---

*This guide is part of your learning journey. Bookmark it and refer back when setting up new projects or explaining your architecture in interviews.*
