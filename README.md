# Finance Tracker API

A RESTful API for personal finance management built with Node.js, Express, TypeScript, and MongoDB. Track income, expenses, budgets, and analytics.

## Current Status

- Score: **7/10** – Solid auth, validation, and security middleware are in place. Needs structured logging, health checks, deployment script, and tests to be production-ready.
- Strengths: JWT auth, Zod validation, helmet + rate limiting, pagination on list endpoints.
- Gaps: No health/ready checks, no structured logger, dev-only start script, no tests yet, pagination metadata not returned.

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

   Create a `.env` file in the root directory:
   ```env
   PORT=8000
   CONNECTION_STRING=your_mongodb_connection_string
   SECRET_KEY=your_jwt_secret_key
   DB_USER=your_db_username
   DB_USER_PASSWORD=your_db_password
   ENC_ALGO=HS256
   CORS_ORIGIN=http://localhost:3000,http://localhost:4200
   ```

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

## Scripts

- `npm run dev` - Start development server with hot reload (tsx)
- `npm start` - Alias for development watch
- `npm run dev-dist` - Run compiled JavaScript from `dist/` (requires prior build step)
- `npm test` - Placeholder (no tests yet)

**Production suggestion:** add a build step (`tsc`) and `start:prod` script (`node dist/server.js`) before deploying.

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
| `CONNECTION_STRING` | MongoDB connection string | Yes |
| `SECRET_KEY` | JWT secret key | Yes |
| `DB_USER` | Database username | NO (If you added it in connection string)|
| `DB_USER_PASSWORD` | Database password | NO (If you added it in connection string) |
| `ENC_ALGO` | JWT encryption algorithm (e.g., HS256) | Yes |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | Yes |

## Production Hardening (next steps)

- Add `/healthz` and `/readyz` endpoints (ping DB, return 200/500).
- Add structured logging (Winston or Pino) with JSON output and request logging.
- Add a build + `start:prod` script and consider a Dockerfile for deployment.
- Return pagination metadata (`totalItems`, `totalPages`, `pageNo`, `limit`) on list endpoints.
- Add integration tests for auth, budgets, transactions, and categories.

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

