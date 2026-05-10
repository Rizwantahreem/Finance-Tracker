# Finance Tracker API

A RESTful API for personal finance management built with Node.js, Express, TypeScript, and MongoDB. Track income, expenses, budgets, and analytics.

## Current Status

- Strengths: JWT auth, Zod validation, Helmet + rate limiting, pagination on list endpoints, Pino structured logging, `/healthz` and `/readyz`, Vitest integration tests, Docker multi-stage image, separate Compose files for development and staging.
- Production polish: pagination metadata on list responses, OpenAPI docs, and CI/CD are still optional next steps.

## Features

- **User Authentication**: JWT-based auth with role-based access control
- **Transaction & Category Management**: CRUD for income/expense transactions and categories
- **Budget Tracking**: Monthly budgets with soft delete
- **Analytics Dashboard**: Spending patterns, budget utilization, and summaries
- **Security**: Helmet, CORS, rate limiting (10 requests / 15 min window), bcrypt hashing
- **Validation**: Zod schemas across inputs
- **Pagination**: Skip/limit pagination on list endpoints

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finance-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy [.example.env](./.example.env) to `.env` and fill in real values. Required fields are validated at startup in [`config/env.ts`](./config/env.ts).

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:8000` (or the port specified in your `.env` file).

## Project Structure

```
finance-tracker/
├── config/              # Configuration files
│   ├── DbConnection.ts  # MongoDB connection
│   └── env.ts          # Environment variables validation
├── constants/           # Constants and interfaces
├── controllers/         # Request handlers
│   ├── analytics.controller.ts
│   ├── budget.controller.ts
│   ├── category.controller.ts
│   ├── transaction.controller.ts
│   └── users.controller.ts
├── middlewares/        # Express middlewares
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   ├── not-found.middleware.ts
│   ├── role-based-access.middleware.ts
│   └── security-middleware.ts
├── models/             # Mongoose models
│   ├── budget.model.ts
│   ├── category.model.ts
│   ├── transaction.model.ts
│   └── user.model.ts
├── routers/            # Route definitions
│   ├── analytics.router.ts
│   ├── budget.router.ts
│   ├── category.router.ts
│   ├── transaction.router.ts
│   └── users.router.ts
├── services/           # Business logic
│   ├── dashboard.service.ts
│   └── user.service.ts
├── types/              # TypeScript type definitions
│   └── express.d.ts
├── utils/              # Utility functions
│   ├── AppError.ts
│   └── date.util.ts
├── validators/         # Zod validation schemas
│   ├── budget.validator.ts
│   ├── category.validator.ts
│   ├── transaction.validator.ts
│   └── user.validator.ts
├── server.ts           # Application entry point
└── package.json
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

The token is automatically set as an HTTP-only cookie upon successful login.

## API Endpoints

### Authentication

- `POST /api/user/sign-up` - Register a new user
- `POST /api/user/log-in` - Login and get JWT token

### Transactions

- `GET /api/transaction` - Get all transactions (requires auth; supports pagination via `pageNo`, `limit`)
- `GET /api/transaction/:id` - Get a specific transaction (requires auth)
- `POST /api/transaction` - Create a new transaction (requires auth)
- `PATCH /api/transaction/:id` - Update a transaction (requires auth)
- `DELETE /api/transaction/:id` - Delete a transaction (requires auth)

### Categories

- `POST /api/category` - Create a new category (requires auth)
- `GET /api/category/:isCustom` - Get categories (requires auth; supports pagination via `pageNo`, `limit`)

### Budgets

- `POST /api/budget` - Create a new budget (requires auth)
- `GET /api/budget` - Get all budgets (requires auth; supports pagination via `pageNo`, `limit`)
- `GET /api/budget/:id` - Get a specific budget (requires auth)
- `PATCH /api/budget/:id` - Update a budget (requires auth)
- `DELETE /api/budget/:id` - Delete a budget (requires auth)

### Analytics/Dashboard

- `GET /api/dashboard/summary` - Get monthly summary (requires auth)
- `GET /api/dashboard/month-in-glance` - Get detailed monthly expenses (requires auth)
- `GET /api/dashboard/budget-tracking` - Get budget vs transaction data (requires auth)
- `GET /api/dashboard/recent-transactions` - Get recent transactions (requires auth)

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

## Docker

| File | Purpose |
|------|---------|
| [`Dockerfile`](./Dockerfile) | Multi-stage build; `production` target runs compiled Node app as a non-root user. |
| [`docker-compose.yml`](./docker-compose.yml) | Local **development** stack: service `finance-tracker-dev`, port `8000`, loads `.env`. |
| [`docker-compose.staging.yml`](./docker-compose.staging.yml) | **Staging** stack: service `finance-tracker-staging`, loads `.env.staging`, expects host-side Compose variables `CONNECTION_STRING_STAGING`, `SECRET_KEY_STAGING`, and `CORS_ORIGIN_STAGING` for YAML substitution (define them in project-root `.env` or your shell — see [.example.env](./.example.env)). |

```bash
npm run build
npm run docker:dev              # development compose
npm run docker:staging          # staging compose (uses -f docker-compose.staging.yml)
npm run docker:staging:down     # tear down staging stack
npm run docker:down             # tear down default (dev) compose project
```

Build staging image explicitly:

```bash
docker compose -f docker-compose.staging.yml build
docker compose -f docker-compose.staging.yml up
```

Compose validates service names under `services:` — use YAML comments (`# ...`) for labels, not bare keys like `Staging environment:`.

### Secrets and logs

The API **does not log** `SECRET_KEY`. When it logs MongoDB connection details, the URI is **redacted** (credentials replaced with `//***@`) in [`config/DbConnection.ts`](./config/DbConnection.ts).

Avoid sharing the full output of `docker compose config`: it resolves `${…}` from your environment and can **print secret values**. Inspect the compose YAML directly, or validate in a private shell.

## Scripts

- `npm run dev` - Start development server with hot reload (tsx)
- `npm run build` - Compile TypeScript to `dist/`
- `npm start` / `npm run start:prod` - Run compiled app (`node dist/server.js`)
- `npm test` - Vitest integration tests

**Tests and MongoDB:** Tests use **`CONNECTION_STRING` from `.env`** (Atlas, same as `npm run dev`) with database **`finance-tracker-test`** only. `afterEach` clears all collections there — keep dev data in a different DB (e.g. `finance-tracker-dev`).

```env
# Optional: different URI for tests only
TEST_MONGODB_URI=...
TEST_DB_NAME=finance-tracker-test
```

## Security Features

- **Helmet**: Secure HTTP headers
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: 10 requests per 15 minutes per IP
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with 12 salt rounds
- **Input Validation**: Zod schema validation for inputs
- **Error Handling**: Centralized error handling with proper error messages

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Validation**: Zod
- **Authentication**: JWT (jsonwebtoken)
- **Security**: Helmet, CORS, express-rate-limit
- **Password Hashing**: bcrypt

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port number | Yes |
| `NODE_ENV` | `development` \| `staging` \| `production` \| `test` | Optional (defaults to `development`) |
| `CONNECTION_STRING` | MongoDB connection string | Yes |
| `DB_NAME` | Database name | Optional (defaults by `NODE_ENV`; see `config/env.ts`) |
| `SECRET_KEY` | JWT secret key | Yes |
| `DB_USER` | Database username | Optional if embedded in connection string |
| `DB_USER_PASSWORD` | Database password | Optional if embedded in connection string |
| `ENC_ALGO` | JWT encryption algorithm (e.g., HS256) | Yes |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | Yes |
| `LOG_LEVEL` | Pino level: `fatal` … `trace` | Optional |

**Staging Docker Compose (host / root `.env`):** `CONNECTION_STRING_STAGING`, `SECRET_KEY_STAGING`, `CORS_ORIGIN_STAGING` — passed into the container as `CONNECTION_STRING`, `SECRET_KEY`, and `CORS_ORIGIN`. See [.example.env](./.example.env).

## Production Hardening (next steps)

- Return pagination metadata (`totalItems`, `totalPages`, `pageNo`, `limit`) on list endpoints.
- Add a production-focused `docker-compose` (or platform-specific) definition when you deploy.
- Expand integration tests and CI (e.g., GitHub Actions) as needed.

## Error Handling

The API uses a centralized error handling system:

- **400 Bad Request**: Validation errors or invalid input
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side errors

All errors are returned in JSON format:
```json
{
  "message": "Error message here"
}
```

## License

ISC

## Author

Tahreem Rizwan


---

For detailed API documentation with request/response examples, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

