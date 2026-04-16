# SpendWise Backend API

A backend service for tracking personal finances, managing transactions, and generating spending analytics. Built with Node.js, Express, and Prisma ORM for PostgreSQL.

## Project Overview

This API enables users to securely sign up, create expenses and income transactions, assign categories, and query analytics across date ranges. It is designed for integration with any frontend dashboard or mobile client.

## Tech Stack

- Backend: `Node.js`, `Express.js`
- Database: `PostgreSQL`
- ORM: `Prisma`
- Authentication: `JWT`
- Language: `JavaScript` (ES Modules)

## Core Features

### Authentication

- `POST /api/auth/signup`
- `POST /api/auth/login`
- JWT token generation for protected routes
- `authMiddleware` protects transaction and analytics endpoints

### Transaction Management

- `POST /api/transactions` to create a transaction
- `GET /api/transactions` to list transactions
- Amounts stored in `kobo` to prevent floating-point currency issues
- Transactions are linked to:
  - `User`
  - `Category`
  - `TransactionType` (`INCOME` / `EXPENSE`)

### Category System

- System categories are seeded by `prisma/seed.js`
- Default categories include:
  - `Food`, `Transport`, `Bills`, `Shopping`, `Data`, `Income`, `Other`
- Supports nullable/uncategorized transactions

### Analytics Engine

Built with Prisma aggregation and grouping helpers.

#### 1. Total Spending

- Computes total expenses in a date range

#### 2. Category Breakdown

- Groups expenses by category
- Maps category IDs to readable names
- Handles `null` category IDs as `Uncategorized`

#### 3. Burn Rate

- Computes total spent over the last `N` days
- Daily average spending
- Average per expense transaction

#### 4. Full Analytics Response

- Returns combined metrics:
  - Total spent in `kobo` and `naira`
  - Category breakdown
  - Daily averages
  - Per-transaction average for burn rate

## Data Model

Models are defined in `prisma/schema.prisma`.

- `User`
- `Category`
- `Transaction`
- `TransactionType` enum: `INCOME`, `EXPENSE`

## Project Structure

- `server.js` — Express application entrypoint
- `config/prisma.js` — Prisma client setup
- `controllers/` — Request handlers
- `middleware/authMiddleware.js` — JWT protection logic
- `routes/` — Route definitions
- `services/analytics/` — Analytics logic and helpers
- `prisma/seed.js` — Seed data script
- `prisma/schema.prisma` — Prisma schema

## API Endpoints

### Auth

- `POST /api/auth/signup`
  - Request body: `{ email, password, fullName }`
  - Returns user data and `token`
- `POST /api/auth/login`
  - Request body: `{ email, password }`
  - Returns user data and `token`

### Transactions

- `POST /api/transactions`
  - Protected route
  - Request body: `{ amount, type, categoryId?, description? }`
  - Note: `amount` is converted to `amountKobo` on save
- `GET /api/transactions`
  - Protected route
  - Optional query params:
    - `categoryId`
    - `category` (name)
    - `type` (`INCOME` or `EXPENSE`)
    - `startDate`
    - `endDate`
    - `page`
    - `limit`
  - Returns paginated results

### Analytics

- `GET /api/analytics?startDate=&endDate=`
  - Protected route
  - Returns spending analytics for the given date range
- `GET /api/analytics/burn-rate?days=30`
  - Protected route
  - Returns burn rate metrics for the last `N` days (default `30`)

## Sample Analytics Output

```json
{
  "success": true,
  "data": {
    "totalSpentKobo": 4500000,
    "totalSpentNaira": 45000,
    "categoryBreakdown": [
      {
        "category": "Shopping",
        "totalKobo": 1500000,
        "totalNaira": 15000
      }
    ],
    "dailyAverageKobo": 12362,
    "dailyAverageNaira": 123.62
  }
}
```

## Database Seeding

The project uses Prisma seeding via `prisma/seed.js`.

Seed behavior:

- Creates default system categories if missing
- Inserts mock transactions for a test user
- Uses an existing hard-coded `userId` inside `prisma/seed.js`

## Getting Started

### Requirements

- `Node.js` 20+
- `PostgreSQL`
- `.env` values:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - optional: `PORT`

### Setup

```bash
npm install
npx prisma db push
npx prisma db seed
node server.js
```

### Environment Example

```env
DATABASE_URL=postgresql://user:password@localhost:5432/your_db
JWT_SECRET=your_jwt_secret
PORT=5002
```

## Notes

- `amount` values are stored in kobo to avoid floating point rounding issues.
- Analytics are implemented in the `services/analytics/` layer, keeping controllers thin.
- Protected routes require `Authorization: Bearer <token>`.
- Transaction listing supports filtering and pagination.

## Current Status

Core features implemented:

- Authentication
- Transactions
- Categories
- Analytics engine
- Seed data support
- Burn rate calculation

Improvements to add:

- More advanced filtering UX
- Better transaction metadata
- Time-series analytics
- Dashboard-ready aggregation endpoints
- Caching for analytics
- Budget tracking + overspending alerts

## Notes for Developers

- `POST /api/transactions` expects `amount` in naira and converts it to `kobo`.
- `GET /api/transactions` returns a pagination object along with results.
- `GET /api/analytics` requires both `startDate` and `endDate`.
- `GET /api/analytics/burn-rate` defaults to 30 days when no `days` query value is provided.
