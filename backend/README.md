# SpendWise Backend API

A production-ready personal finance backend service that tracks transactions, manages analytics, and handles user authentication. Built with Node.js 18+, Express.js, and Prisma ORM for PostgreSQL.

---

## Project Overview

SpendWise is a personal finance backend system that enables users to track income and expenses, categorize spending automatically, and generate real-time financial analytics. It is optimized for integration with web and mobile dashboards.

The system supports both manual categorization and AI-assisted category detection based on transaction descriptions.

---

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + Google OAuth 2.0
- **Password Hashing**: bcryptjs
- **CORS**: Enabled for frontend integration
- **Logging**: Custom request logger with timing

---

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

### Analytics Engine

Real-time financial insights with optimized aggregations.

**Endpoints:**

- GET `/api/analytics?startDate=&endDate=` — Total spending & category breakdown
- GET `/api/analytics/burn-rate?days=30` — Spending velocity & daily average

**Returns:**

- Total spent over period
- Spending by category
- Daily average spend
- Spending velocity
- Per-transaction averages
- Uncategorized transaction handling

**Performance:**

- Moved heavy computation to service layer
- Minimal controller logic
- Database indexes on userId, transactionDate, categoryId, type

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
│   └── analyticsController.js         # Analytics & burn-rate
├── middleware/
│   ├── authMiddleware.js              # JWT verification
│   └── requestLogger.js               # Request timing & logging
├── routes/
│   ├── authRoutes.js                  # /api/auth endpoints
│   ├── transactionRoutes.js           # /api/transactions endpoints
│   └── analyticsRoutes.js             # /api/analytics endpoints
├── services/
│   ├── auth/
│   │   └── googleAuthService.js       # Google OAuth token verification
│   ├── categoryDetectionService.js    # Keyword-based category detection
│   ├── analytics/
│   │   ├── analyticsService.js        # Total spend & breakdown
│   │   ├── analyticsUtils.js          # Helper utilities
│   │   ├── burnrateService.js         # Daily average & velocity
│   │   ├── categoryService.js         # Category aggregation
│   │   └── spendingService.js         # Spending calculations
├── utils/
│   ├── apiResponse.js                 # Standard response wrapper
│   └── money.js                       # Kobo/Naira conversion
├── prisma/
│   ├── schema.prisma                  # Database schema
│   ├── seed.js                        # Seed script (categories, keywords)
│   └── migrations/                    # Database migration history
│   │   ├── migration_lock.toml
│   │   ├── 20260415233029_init/
│   │   ├── 20260419141349_add_oauth_fields/
│   │   └── ...
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

#### Total Spending & Breakdown

```json
GET /api/analytics?startDate=2026-04-01&endDate=2026-04-30
Authorization: Bearer <token>

Response: {
  totalSpent,
  byCategory: [{ category, amount, percent }],
  averageTransaction,
  transactionCount
}
```

#### Burn Rate & Velocity

```json
  GET /api/analytics/burn-rate?days=30
  Authorization: Bearer <token>

  Response: {
    totalSpent,
    dailyAverage,
    days,
    velocity,
    byDay: [{ date, amount }]
}
```

---

## Development

### Scripts

```bash
npm run dev      # Start with nodemon (hot reload)
npm start        # Run production server
npm test         # Run tests (not configured yet)
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
DATABASE_URL=postgresql://user:password@localhost:5432/spendwise

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxx

# Server
PORT=5000
NODE_ENV=development
```

---

## Deployment Notes

- Uses `@prisma/adapter-pg` for optimized PostgreSQL connections
- CORS enabled for frontend communication
- Environment variables required for production
- JWT tokens expire after 7 days
- All endpoints return standardized JSON responses

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
