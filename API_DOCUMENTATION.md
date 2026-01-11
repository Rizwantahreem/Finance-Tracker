# Finance Tracker API Documentation

Complete API reference for the Finance Tracker application.

**Base URL**: `http://localhost:8000/api`

All endpoints (except authentication) require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Table of Contents

1. [Authentication](#authentication)
2. [Transactions](#transactions)
3. [Categories](#categories)
4. [Budgets](#budgets)
5. [Analytics/Dashboard](#analyticsdashboard)

---

## Authentication

### Register User

Create a new user account.

**Endpoint**: `POST /api/user/sign-up`

**Authentication**: Not required

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "age": 25,
  "role": "user",
  "phoneNumber": "1234567890",
  "isEmailVerified": false
}
```

**Validation Rules**:
- `name`: String, 3-100 characters
- `email`: Valid email format, unique
- `password`: String, minimum 6 characters
- `age`: Number, minimum 10
- `role`: String, maximum 50 characters
- `phoneNumber`: Optional, 10 digits
- `isEmailVerified`: Boolean, defaults to false

**Response** (201 Created):
```json
{
  "message": "user with id 507f1f77bcf86cd799439011 created."
}
```

**Error Responses**:
- `400`: Validation error
- `500`: Server error

---

### Login

Authenticate user and receive JWT token.

**Endpoint**: `POST /api/user/log-in`

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response** (200 OK):
```json
{
  "message": "log in successful"
}
```

**Note**: JWT token is automatically set as an HTTP-only cookie.

**Error Responses**:
- `400`: Invalid credentials
- `404`: User not found
- `500`: Server error

---

## Transactions

### Get All Transactions

Retrieve all transactions for the authenticated user.

**Endpoint**: `GET /api/transaction`

**Authentication**: Required (Bearer token)

**Query Parameters**: None (pagination to be implemented)

**Response** (200 OK):
```json
{
  "transactions": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "amount": 100.50,
      "description": "Grocery shopping",
      "type": "expense",
      "category": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439013",
      "transactionDate": "2024-01-15T10:30:00.000Z",
      "isDeleted": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "message": "Fetched transactions"
}
```

**Error Responses**:
- `401`: Unauthorized
- `500`: Server error

---

### Get Single Transaction

Retrieve a specific transaction by ID.

**Endpoint**: `GET /api/transaction/:id`

**Authentication**: Required (Bearer token)

**URL Parameters**:
- `id`: Transaction ID (MongoDB ObjectId)

**Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "amount": 100.50,
  "description": "Grocery shopping",
  "type": "expense",
  "category": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439013",
  "transactionDate": "2024-01-15T10:30:00.000Z",
  "isDeleted": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `400`: Invalid ID
- `401`: Unauthorized
- `404`: Transaction not found
- `500`: Server error

---

### Create Transaction

Create a new income or expense transaction.

**Endpoint**: `POST /api/transaction`

**Authentication**: Required (Bearer token)

**Request Body** (Expense):
```json
{
  "amount": 100.50,
  "description": "Grocery shopping",
  "type": "expense",
  "categoryId": "507f1f77bcf86cd799439012",
  "transactionDate": "2024-01-15T10:30:00.000Z"
}
```

**Request Body** (Income):
```json
{
  "amount": 5000.00,
  "description": "Salary",
  "type": "income",
  "transactionDate": "2024-01-15T10:30:00.000Z"
}
```

**Validation Rules**:
- `amount`: Number, 0-99999999
- `description`: Optional string
- `type`: "expense" or "income"
- `categoryId`: Required for expenses, not allowed for income
- `transactionDate`: Optional date, defaults to current date

**Response** (201 Created):
```json
{
  "message": "transaction with id 507f1f77bcf86cd799439011 created successfully"
}
```

**Error Responses**:
- `400`: Validation error
- `401`: Unauthorized
- `500`: Server error

---

### Update Transaction

Update an existing transaction.

**Endpoint**: `PATCH /api/transaction/:id`

**Authentication**: Required (Bearer token)

**URL Parameters**:
- `id`: Transaction ID (MongoDB ObjectId)

**Request Body** (Partial update allowed):
```json
{
  "amount": 150.00,
  "description": "Updated description"
}
```

**Response** (200 OK):
```json
{
  "message": "transaction with id 507f1f77bcf86cd799439011 updated."
}
```

**Error Responses**:
- `400`: Invalid value(s) or validation error
- `401`: Unauthorized
- `404`: Transaction not found
- `500`: Server error

---

### Delete Transaction

Soft delete a transaction (sets `isDeleted` to true).

**Endpoint**: `DELETE /api/transaction/:id`

**Authentication**: Required (Bearer token)

**URL Parameters**:
- `id`: Transaction ID (MongoDB ObjectId)

**Response** (200 OK):
```json
{
  "message": "Transaction with id 507f1f77bcf86cd799439011 deleted successfully"
}
```

**Error Responses**:
- `400`: Invalid id
- `401`: Unauthorized
- `404`: Transaction not found or already deleted
- `500`: Server error

---

## Categories

### Create Category

Create a new transaction category.

**Endpoint**: `POST /api/category`

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "name": "Groceries",
  "type": "expense",
  "description": "Food and household items"
}
```

**Validation Rules**:
- `name`: Required string
- `type`: "expense" or "income"
- `description`: Optional string
- `userId`: Automatically set from authenticated user

**Response** (201 Created):
```json
{
  "message": "Category with id 507f1f77bcf86cd799439011 created"
}
```

**Error Responses**:
- `400`: Validation error or invalid body
- `401`: Unauthorized
- `500`: Server error

---

### Get Categories

Retrieve categories. Can fetch all categories or user-specific custom categories.

**Endpoint**: `GET /api/category/:isCustom`

**Authentication**: Required (Bearer token)

**URL Parameters**:
- `isCustom`: Boolean (true/false) - if true, returns only user's custom categories

**Response** (200 OK):
```json
{
  "message": "categories fetch.",
  "categories": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Groceries",
      "type": "expense",
      "description": "Food and household items",
      "userId": "507f1f77bcf86cd799439013",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Error Responses**:
- `401`: Unauthorized
- `500`: Server error

---

## Budgets

### Create Budget

Create a new monthly budget for a category.

**Endpoint**: `POST /api/budget`

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "budgetAmount": 1000.00,
  "month": 1,
  "year": 2024,
  "category": "507f1f77bcf86cd799439012"
}
```

**Validation Rules**:
- `budgetAmount`: Required number
- `month`: Required number (1-12)
- `year`: Required number
- `category`: Required MongoDB ObjectId
- `userId`: Automatically set from authenticated user

**Response** (201 Created):
```json
{
  "message": "Budget with id 507f1f77bcf86cd799439011 created."
}
```

**Error Responses**:
- `400`: Validation error
- `401`: Unauthorized
- `500`: Server error

---

### Get All Budgets

Retrieve all non-deleted budgets.

**Endpoint**: `GET /api/budget`

**Authentication**: Required (Bearer token)

**Response** (200 OK):
```json
{
  "message": "Budgets found.",
  "budget": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "budgetAmount": 1000.00,
      "month": 1,
      "year": 2024,
      "category": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439013",
      "isDeleted": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Error Responses**:
- `401`: Unauthorized
- `500`: Server error

---

### Get Single Budget

Retrieve a specific budget by ID.

**Endpoint**: `GET /api/budget/:id`

**Authentication**: Required (Bearer token)

**URL Parameters**:
- `id`: Budget ID (MongoDB ObjectId)

**Response** (200 OK):
```json
{
  "message": "Budget with id 507f1f77bcf86cd799439011 found.",
  "budget": {
    "_id": "507f1f77bcf86cd799439011",
    "budgetAmount": 1000.00,
    "month": 1,
    "year": 2024,
    "category": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439013",
    "isDeleted": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses**:
- `401`: Unauthorized
- `500`: Server error

---

### Update Budget

Update an existing budget.

**Endpoint**: `PATCH /api/budget/:id`

**Authentication**: Required (Bearer token)

**URL Parameters**:
- `id`: Budget ID (MongoDB ObjectId)

**Request Body** (Partial update allowed):
```json
{
  "budgetAmount": 1500.00
}
```

**Response** (200 OK):
```json
{
  "message": "Budget with id 507f1f77bcf86cd799439011 updated."
}
```

**Error Responses**:
- `400`: Invalid data or validation error
- `401`: Unauthorized
- `404`: Budget not found
- `500`: Server error

---

### Delete Budget

Soft delete a budget (sets `isDeleted` to true).

**Endpoint**: `DELETE /api/budget/:id`

**Authentication**: Required (Bearer token)

**URL Parameters**:
- `id`: Budget ID (MongoDB ObjectId)

**Response** (200 OK):
```json
{
  "message": "Budget with id 507f1f77bcf86cd799439011 deleted."
}
```

**Error Responses**:
- `401`: Unauthorized
- `404`: Budget not found
- `500`: Server error

---

## Analytics/Dashboard

### Get Monthly Summary

Get comprehensive monthly financial summary including savings, expenses, and budget tracking.

**Endpoint**: `GET /api/dashboard/summary`

**Authentication**: Required (Bearer token)

**Response** (200 OK):
```json
{
  "summary": {
    "totalSavings": 3500.00,
    "totalExpenses": 1500.00,
    "highlySpentCategory": "Groceries",
    "budgetToExpenseTracking": "+15.50",
    "unbudgetedSpending": 200.00,
    "unUsedBudget": 300.00
  },
  "message": "Monthly summary fetched."
}
```

**Fields Description**:
- `totalSavings`: Income minus expenses
- `totalExpenses`: Total expense amount for the month
- `highlySpentCategory`: Category with highest spending
- `budgetToExpenseTracking`: Budget utilization percentage with sign (+ over budget, - under budget)
- `unbudgetedSpending`: Spending on categories without budgets
- `unUsedBudget`: Unused budget amount

**Error Responses**:
- `401`: Unauthorized
- `500`: Server error

---

### Get Detailed Monthly Expenses

Get expenses broken down by category for the current month.

**Endpoint**: `GET /api/dashboard/month-in-glance`

**Authentication**: Required (Bearer token)

**Response** (200 OK):
```json
{
  "message": "fetched this month expenses",
  "transactions": [
    {
      "categoryId": "507f1f77bcf86cd799439012",
      "categoryName": "Groceries",
      "totalAmount": 500.00
    },
    {
      "categoryId": "507f1f77bcf86cd799439013",
      "categoryName": "Transportation",
      "totalAmount": 300.00
    }
  ]
}
```

**Error Responses**:
- `401`: Unauthorized
- `500`: Server error

---

### Get Budget and Transaction by Category

Get budget vs actual spending comparison by category.

**Endpoint**: `GET /api/dashboard/budget-tracking`

**Authentication**: Required (Bearer token)

**Response** (200 OK):
```json
{
  "message": "Fetched budget and transaction data.",
  "budgetAndTransactionData": [
    {
      "categoryName": "Groceries",
      "budgetSum": 1000.00,
      "transactionSum": 500.00
    },
    {
      "categoryName": "Transportation",
      "budgetSum": 500.00,
      "transactionSum": 300.00
    }
  ]
}
```

**Error Responses**:
- `401`: Unauthorized
- `500`: Server error

---

### Get Recent Transactions

Get the 3 most recent transactions.

**Endpoint**: `GET /api/dashboard/recent-transactions`

**Authentication**: Required (Bearer token)

**Response** (200 OK):
```json
{
  "message": "fetched recent transactions successfully",
  "transactions": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "amount": 100.50,
      "categoryName": "Groceries"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "amount": 50.00,
      "categoryName": "Transportation"
    }
  ]
}
```

**Error Responses**:
- `401`: Unauthorized
- `500`: Server error

---

## Error Responses

All error responses follow this format:

```json
{
  "message": "Error description"
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Validation error or invalid input
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

### Validation Errors

When validation fails, the response includes detailed error information:

```json
{
  "message": "Validation error",
  "errors": [
    {
      "path": ["email"],
      "message": "Invalid email format"
    }
  ]
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Limit**: 8 requests per 15 minutes per IP address
- **Headers**: Rate limit information is included in response headers

---

## Notes

1. All dates are in ISO 8601 format (UTC)
2. All monetary amounts are in numbers (not strings)
3. MongoDB ObjectIds are used for all ID fields
4. Soft deletes are used (records are marked as deleted, not removed)
5. All timestamps are automatically managed by Mongoose

---

For questions or issues, please refer to the main [README.md](./README.md) file.

