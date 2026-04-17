# SpendWise Backend API

A backend service for tracking personal finances, managing transactions, and generating spending analytics. Built with Node.js, Express, and Prisma ORM for PostgreSQL.

---

## Project Overview

SpendWise is a personal finance backend system that enables users to track income and expenses, categorize spending automatically, and generate real-time financial analytics. It is optimized for integration with web and mobile dashboards.

The system supports both manual categorization and AI-assisted category detection based on transaction descriptions.

---

## Tech Stack

- Backend: Node.js, Express.js
- Database: PostgreSQL
- ORM: Prisma
- Authentication: JWT
- Language: JavaScript (ES Modules)

---

## Core Features

### Authentication

- POST `/api/auth/signup`
- POST `/api/auth/login`
- JWT-based authentication
- Protected routes via `authMiddleware`

---

### Transaction Management

- POST `/api/transactions` — Create transactions
- GET `/api/transactions` — Fetch transactions (with filtering + pagination)

#### Key Features

- Stores amounts in **kobo** (prevents floating-point errors)
- Automatically converts to **naira in responses**
- Supports:
  - Category assignment (manual or auto-detected)
  - Income & Expense tracking
  - Optional descriptions

#### Category Auto-Detection

- Uses keyword-based matching system
- Maps transaction descriptions to predefined categories

---

### Category System

- System categories seeded via `prisma/seed.js`
- Default categories:
  - Food
  - Transport
  - Bills
  - Shopping
  - Data
  - Income
  - Other

#### Features

- Supports system + user-linked categories
- Handles uncategorized transactions gracefully
- Keyword-based category mapping via `CategoryKeyword` table

---

### Analytics Engine

Built using Prisma aggregation + service-layer architecture.

#### 1. Total Spending

- Calculates total expenses over a time range

#### 2. Category Breakdown

- Groups spending by category
- Handles uncategorized transactions

#### 3. Burn Rate Analysis

- Daily average spending
- Total spend over N days
- Per-transaction averages

#### 4. Optimized Aggregations

- Designed to minimize controller logic
- Heavy computation moved to service layer

---

### Performance & Optimization (Day 7 Complete)

- Added database indexes for faster queries:
  - `userId`
  - `transactionDate`
  - `categoryId`
  - `type`
- Optimized category filtering (reduced relational filtering overhead)
- Introduced request logging middleware for performance monitoring
- Reduced payload size via selective field loading
- Improved pagination safety and limits

---

## Data Model

Defined in `prisma/schema.prisma`

### Models

- User
- Category
- Transaction
- CategoryKeyword

### Enum

```prisma
TransactionType {
  INCOME
  EXPENSE
}
```

---

## Project Structure

- `server.js`                 → App entry point
- `config/prisma.js`         → Prisma client
- `controllers/`             → Route handlers
- `middleware/`              → Auth + logging middleware
- `routes/`                  → API routes
- `services/`                → Business logic (analytics, category detection)
- `utils/`                   → Helpers (money formatting, responses)
- `prisma/seed.js`           → Database seeding
- `prisma/schema.prisma`     → Database schema

---

## API Endpoints

### Auth

- POST `/api/auth/signup`
  - `{ "email": "", "password": "", "fullName": "" }`
- POST `/api/auth/login`
  - `{ "email": "", "password": "" }`

### Transactions

- POST `/api/transactions`

  ```json
  {
    "amount": 5000,
    "type": "EXPENSE",
    "categoryId": "",
    "description": "optional"
  }
  ```

- GET `/api/transactions`

Query Params:

- `categoryId`
- `category` (name)
- `type` (INCOME | EXPENSE)
- `startDate`
- `endDate`
- `page`
- `limit`

Features:

- Pagination
- Filtering
- Auto category resolution
- Optimized DB queries

### Analytics

- GET `/api/analytics?startDate=&endDate=`
  - Returns total spent, category breakdown, averages
- GET `/api/analytics/burn-rate?days=30`
  - Returns total spend over time, daily average, spending velocity

---

## Sample Analytics Response

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

---

## Database Seeding

System categories auto-created
Transaction seed data for testing
Category keyword mapping for auto-detection

Run:

```bash
npx prisma db seed
```

---

## Setup Instructions

Install dependencies

```bash
npm install
```

Setup database

```bash
npx prisma db push
npx prisma db seed
```

Run server

```bash
node server.js
```

---

## Environment Variables

```env
DATABASE_URL=
JWT_SECRET=
PORT=
```

---

## Notes

- All money values are stored in kobo
- Naira conversion happens at response layer
- Authentication required for all core endpoints
- Analytics logic is service-layer driven (clean architecture)
- System is optimized for scalability and filtering performance

---

## Current Status

### Completed

- Database design
- Authentication system
- Transaction API
- Filtering + pagination
- Analytics engine
- Category auto-detection
- Seed system
- Performance indexing
- Request logging middleware

### Next Enhancements

- Redis caching layer for analytics
- Time-series charts API
- Budget tracking system
- Expense alerts
- Advanced merchant recognition
- Real-time dashboard aggregation
