# SpendWise Backend API

A production-ready personal finance backend service that tracks transactions, manages analytics, and handles user authentication. Built with Node.js 18+, Express.js, and Prisma ORM for PostgreSQL.

## Quick Start API Docs

Interactive Swagger UI (local): [http://localhost:5002/api-docs](http://localhost:5002/api-docs)

Production Swagger UI: [https://spendwise-app-39vv.onrender.com/api-docs](https://spendwise-app-39vv.onrender.com/api-docs)

## Project Overview

SpendWise is a comprehensive personal finance backend system that enables users to track income and expenses, categorize spending automatically, ingest SMS transaction alerts, and generate real-time financial analytics. It is optimized for integration with web and mobile dashboards.

**Key capabilities:**
- **Transaction Tracking**: Manual entry or SMS-based auto-import from bank alerts
- **Smart Categorization**: Automatic category detection based on transaction descriptions and SMS keywords
- **Financial Analytics**: Real-time income/expense breakdown, burn rate analysis, and financial summaries
- **Savings Planning**: Personalized safe spend recommendations based on financial goals
- **Multi-Auth**: Email/password and Google OAuth 2.0 authentication

The system supports both manual categorization and intelligent SMS parsing for seamless transaction creation.

## Tech Stack

- **Runtime**: Node.js 18+ (ES Modules)
- **Framework**: Express.js ^5.2.1
- **Database**: PostgreSQL (via @prisma/adapter-pg)
- **ORM**: Prisma ^5.22.0
- **Authentication**: JWT (^9.0.3) + Google OAuth 2.0 (google-auth-library)
- **Password Hashing**: bcryptjs ^3.0.3
- **API Docs**: Swagger (swagger-jsdoc + swagger-ui-express)
- **Other**: cors ^2.8.6, dotenv ^17.4.2, request logging

**Scripts** (package.json):

- `npm run dev` - nodemon server.js
- `npm start` - node server.js

## Core Features

### Authentication

Dual authentication system with email/password and Google OAuth 2.0.

#### Email/Password Auth

- POST `/api/auth/signup` — Create account with email, password, fullName
- POST `/api/auth/login` — Login with email & password
- Returns: JWT token (valid 7 days)

#### Google OAuth

- POST `/api/auth/google` — Authenticate with Google token
- Automatic user creation on first login
- Returns: JWT token + user data

#### Protected Routes

- All transaction & analytics routes require `Authorization: Bearer <token>` header
- Verified via `authMiddleware.js`

---

### Transaction Management

Complete transaction lifecycle with categorization and filtering.

**Endpoints:**

- POST `/api/transactions` — Create transaction
- GET `/api/transactions` — Fetch transactions with filtering

**Create Transaction:**

```json
{
  "amount": 5000,
  "type": "EXPENSE",
  "categoryId": "uuid-or-null",
  "category": "optional-category-name",
  "description": "optional"
}
```

**Query Parameters (GET):**

- `category` — Filter by category name
- `type` — INCOME or EXPENSE
- `startDate` — ISO date string
- `endDate` — ISO date string
- `page` — Page number (default: 1)
- `limit` — Results per page (default: 10, max: 100)

**Features:**

- Amounts stored in **kobo** (prevents floating-point errors)
- Auto-converts to **naira** in responses
- Auto-detects category from description (keyword matching)
- Pagination & filtering built-in
- Optimized with database indexes

---

### Category System

Predefined categories with keyword-based auto-detection.

**Default Categories:**

- Food
- Transport
- Bills
- Shopping
- Data
- Income
- Other

**Features:**

- System categories + user-specific categories
- Keyword mapping for auto-detection
- Handles uncategorized transactions gracefully
- Keyword-based category mapping via `CategoryKeyword` table

---

### SMS Ingestion

Automatically parse bank and merchant SMS alerts to create transactions without manual data entry.

**Endpoints:**

- POST `/api/sms/ingest` — Parse SMS and create transaction

**Features:**

- Intelligent SMS parsing to extract amounts and details
- Auto-detection of transaction type (INCOME/EXPENSE)
- Keyword-based category auto-detection
- Supports messages from banks, merchants, and service providers
- No manual categorization needed for common transaction types

**Example:**

```
Input: "Credit alert: N5000 received from XYZ"
Output: Transaction created with type=INCOME, category=Income
```

---

### Savings Planning

Generate personalized savings plans based on income, expenses, and financial goals.

**Endpoints:**

- GET `/api/savings/plan?startDate=&endDate=` — Get savings recommendations

**Features:**

- Calculates disposable income automatically
- Allocates funds for savings goals
- Recommends safe daily spending limits
- Distributes savings across remaining period
- Provides both kobo and naira values

---

### Analytics API

The analytics module provides financial insights for users including income tracking, expense analysis, category breakdown, and burn rate calculations.

#### Base Endpoint

**GET /api/analytics/summary?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD**

Get full financial overview

**Response:**

```json
{
  "success": true,
  "data": {
    "totalIncomeKobo": 15000000,
    "totalIncomeNaira": 150000,
    "totalExpensesKobo": 4000000,
    "totalExpensesNaira": 40000,
    "netBalanceKobo": 11000000,
    "netBalanceNaira": 110000,
    "burnRate": {
      "totalSpentKobo": 4000000,
      "totalSpentNaira": 40000,
      "dailyAverageKobo": 1094.99,
      "dailyAverageNaira": 10.95,
      "avgPerTransaction": 666666.66,
      "days": 3653
    },
    "expenseBreakdown": [
      {
        "category": "Food",
        "totalKobo": 800000,
        "totalNaira": 8000
      }
    ],
    "incomeBreakdown": [
      {
        "category": "Income",
        "totalKobo": 15000000,
        "totalNaira": 150000
      }
    ]
  }
}
```

#### Burn Rate Endpoint

**GET /api/analytics/burn-rate?days=30**

Get spending velocity over time

**Response:**

```json
{
  "success": true,
  "data": {
    "totalSpentKobo": 4000000,
    "totalSpentNaira": 40000,
    "dailyAverageKobo": 133333.33,
    "dailyAverageNaira": 1333.33,
    "avgPerTransaction": 666666.66,
    "days": 30
  }
}
```

**Features:**

- Income Tracking: Total income per period, Income breakdown by category
- Expense Tracking: Total spending, Category-based breakdown
- Net Balance: Income – Expenses calculation
- Burn Rate Analysis: Daily average spending, Spending velocity trends

**Design Notes:**

- All monetary values stored in kobo
- Converted to naira via utility layer
- Date-range based analytics (no hardcoded time windows)
- Category system is system-wide (not user-specific)

**Performance:**

- Service layer computations (analyticsService.js, burnrateService.js, etc.)
- Database indexes: userId, transactionDate, categoryId, type

---

## Performance & Optimization

Database indexes for fast queries:

- `userId` — Filter transactions by user
- `transactionDate` — Range queries
- `categoryId` — Category filtering
- `type` — Income vs Expense queries

Additional optimizations:

- Request logging middleware with slow request detection
- Selective field loading (reduce payload size)
- Pagination limits & safety checks
- Optimized category filtering (reduced relational overhead)

---

## Database Schema

Defined in `prisma/schema.prisma`

### Core Models

| Model | Purpose |
| --- | --- |
| User | User accounts + OAuth provider fields |
| Transaction | Income/expense entries |
| Category | Spending categories |
| CategoryKeyword | Keywords for auto-detection |

### User Fields

```prisma
- id (UUID, primary key)
- email (unique)
- password (optional, for email/password auth)
- fullName
- provider (GOOGLE or EMAIL)
- googleId (for OAuth)
- createdAt, updatedAt
```

### Transaction Fields

```prisma
- id (UUID, primary key)
- userId (indexed)
- amount (in kobo)
- type (INCOME | EXPENSE)
- category (optional FK)
- description (optional)
- transactionDate (indexed)
- createdAt, updatedAt
```

---

## Project Structure

```bash
backend/
├── server.js                          # Express app entry point
├── package.json                       # Dependencies & scripts
├── config/
│   └── prisma.js                      # Prisma client initialization
├── controllers/
│   ├── authController.js              # Auth logic (signup, login, Google OAuth)
│   ├── transactionController.js       # Transaction CRUD
│   ├── analyticsController.js         # Analytics & burn-rate
│   ├── smsController.js               # SMS message ingestion
│   └── savingsController.js           # Savings plan calculations
├── middleware/
│   ├── authMiddleware.js              # JWT verification
│   └── requestLogger.js               # Request timing & logging
├── routes/
│   ├── authRoutes.js                  # /api/auth endpoints
│   ├── transactionRoutes.js           # /api/transactions endpoints
│   ├── analyticsRoutes.js             # /api/analytics endpoints
│   ├── smsRoutes.js                   # /api/sms endpoints
│   └── savingsRoutes.js               # /api/savings endpoints
├── services/
│   ├── auth/
│   │   └── googleAuthService.js       # Google OAuth token verification
│   ├── categoryDetectionService.js    # Keyword-based category detection
│   ├── analytics/
│   │   ├── analyticsService.js        # Total spend & breakdown
│   │   ├── analyticsUtils.js          # Helper utilities
│   │   ├── burnrateService.js         # Daily average & velocity
│   │   ├── categoryService.js         # Category aggregation
│   │   ├── incomeService.js           # Income tracking
│   │   ├── spendingService.js         # Spending calculations
│   │   └── summaryService.js          # Summary calculations
│   ├── merchant/
│   │   └── merchantService.js         # Merchant data management
│   ├── sms/
│   │   └── smsParser.js               # SMS message parsing & extraction
│   └── finance/
│   │   └── savingsEngine.js           # Savings plan engine
├── utils/
│   ├── apiResponse.js                 # Standard response wrapper
│   └── money.js                       # Kobo/Naira conversion
├── prisma/
│   ├── schema.prisma                  # Database schema
│   ├── seed.js                        # Seed script (categories, keywords)
│   ├── merchantSeed.js                # Merchant seed data
│   └── migrations/                    # Database migration history
│   │   ├── migration_lock.toml
│   │   ├── 20260415233029_init/
│   │   ├── 20260419141349_add_oauth_fields/
│   │   └── ...
├── tests/
│   ├── parserTest.js                  # SMS parser tests
│   ├── savingsTest.js                 # Savings plan tests
│   └── test.js                        # General tests
├── google-test.html                   # OAuth testing utility
└── test.js                            # Test file
```

---

## API Reference

### Authentication Endpoints

#### Email/Password Signup

```json
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure-password",
  "fullName": "John Doe"
}

Response: { token, user }
```

#### Email/Password Login

```json
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure-password"
}

Response: { token, user }
```

#### Google OAuth

```json
POST /api/auth/google
Content-Type: application/json

{
  "token": "google-id-token"
}

Response: { token, user, isNewUser }
```

---

### Transaction Endpoints

#### Create Transaction

```json
POST /api/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5000,
  "type": "EXPENSE",
  "categoryId": "uuid-optional",
  "category": "Food",
  "description": "Lunch at restaurant"
}

Response: { transaction }
```

#### Get Transactions

```json
GET /api/transactions?category=Food&type=EXPENSE&page=1&limit=10&startDate=2026-04-01&endDate=2026-04-30
Authorization: Bearer <token>

Response: { transactions, total, page, limit }
```

---

### Analytics Endpoints

See detailed **Analytics API** section above for full specification, including complete request/response examples with Kobo/Naira values, breakdowns, and burn rate calculations.

**Key endpoints:**

- `GET /api/analytics/summary?startDate=&endDate=`
- `GET /api/analytics/burn-rate?days=30`

**Auth required:** `Authorization: Bearer <token>`

---

### SMS Ingestion API

Automatically create transactions from SMS messages with intelligent parsing and auto-categorization.

**Endpoint:**

**POST /api/sms/ingest**

Parses SMS message, auto-detects category and transaction type (INCOME/EXPENSE based on keywords like 'credit'), and creates transaction record.

**Request:**

```json
{
  "message": "Credit alert: N5000 received from XYZ"
}
```

**Response:**

```json
{
  "success": true,
  "transaction": {
    "id": "uuid",
    "amount": 5000,
    "type": "INCOME",
    "category": "Income",
    "description": "Credit alert: N5000 received from XYZ",
    "transactionDate": "2026-04-22T10:30:00Z"
  }
}
```

**Features:**

- Intelligent SMS parsing to extract amount and description
- Auto-detection of transaction type (INCOME/EXPENSE) using keyword matching
- Automatic category detection based on SMS content
- Creates transaction record with parsed data
- Works with SMS messages from banks and merchants

**Auth required:** `Authorization: Bearer <token>`

---

### Savings Plan API

Get personalized savings recommendations based on income, expenses, and savings goals.

**Endpoint:**

**GET /api/savings/plan?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD**

Calculates a daily safe spend amount based on user's income, expenses, and a predefined savings goal for a specified date range.

**Response:**

```json
{
  "success": true,
  "data": {
    "totalDays": 30,
    "remainingDays": 15,
    "disposableKobo": 11000000,
    "disposableNaira": 110000.00,
    "dailySavingsTargetKobo": 666666,
    "dailySavingsTargetNaira": 6666.66,
    "reservedSavingsKobo": 3333333,
    "reservedSavingsNaira": 33333.33,
    "safeSpendPoolKobo": 7666667,
    "safeSpendPoolNaira": 76666.67,
    "dailySafeSpendKobo": 511111,
    "dailySafeSpendNaira": 5111.11
  }
}
```

**Fields Explained:**

- **disposableNaira**: Total available funds (income - expenses)
- **dailySavingsTargetNaira**: Recommended daily savings amount
- **reservedSavingsNaira**: Total amount to reserve for savings goal
- **safeSpendPoolNaira**: Amount available for safe spending (disposable - reserved savings)
- **dailySafeSpendNaira**: Safe daily spending amount (safeSpendPool / remainingDays)

**Features:**

- Calculates disposable income based on user transactions
- Allocates percentage for savings goals
- Distributes remaining funds across remaining days
- Provides daily safe spend recommendations
- All values in both Kobo and Naira

**Auth required:** `Authorization: Bearer <token>`

---

## Development

### Scripts

```bash
npm run dev      # Start with nodemon (hot reload)
npm start        # Run production server
npm test         # Run tests
```

### Debugging

- **Request Logging**: All requests logged with timing
- **Slow Request Detection**: Requests > 100ms highlighted
- **Error Handling**: Standardized API error responses

### Testing

Run `google-test.html` in browser to test Google OAuth flow.

---

## Environment Variables

Required `.env` file in backend root:

```env
# Database
DATABASE_URL=

# JWT
JWT_SECRET=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Server
PORT=
NODE_ENV=
```

---

## Deployment Notes

- Uses `@prisma/adapter-pg` for optimized PostgreSQL connections
- CORS enabled for frontend communication
- Environment variables required for production
- JWT tokens expire after 7 days
- All endpoints return standardized JSON responses

---

**Sample responses available in Analytics API section above.**

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

## Deployment

Backend is deployed on Render:

Base URL:
[https://spendwise-app-39vv.onrender.com](https://spendwise-app-39vv.onrender.com)

Environment:

- Node.js production server
- PostgreSQL (Prisma cloud DB)
- Hosted on Render Web Service

## Production Notes

- Cold starts may cause initial request delay on Render free tier
- All sensitive values are stored in environment variables
- Database is hosted externally (Prisma/PostgreSQL)

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
