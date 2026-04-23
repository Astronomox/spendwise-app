# SpendWise

> Track every naira. Build real wealth.

SpendWise is a Nigerian-first personal finance app that turns your bank SMS alerts into a complete picture of your money. Built for urban Nigerians who want to spend smarter — without the spreadsheets.

---

## The Problem

Every time you spend money, your bank sends you an SMS. You read it, feel a moment of mild panic, and move on. By end of month you have no idea where ₦150,000 went.

SpendWise fixes that.

---

## What It Does

### Auto-logging from SMS

SpendWise reads your bank alert messages in real time — GTBank, Zenith, Kuda, Access Bank, First Bank, UBA, Opay, and more. Every debit is automatically parsed, categorised, and logged. No manual input needed.

### Manual cash logger

For cash transactions that don't trigger an SMS. 3 taps: pick a category, enter the amount, confirm. Done in under 10 seconds.

### Dashboard

Your financial picture at a glance — total spent this month, budget progress, daily safe spend limit, 7-day spending chart, and top spending categories.

### Savings goals

Set a target (save ₦500,000 for a new laptop by April), track your progress, and see exactly how much you need to set aside each day to get there.

### Smart alerts

Get notified when you've spent 2× your daily average, when you've hit a budget streak, or when a savings goal milestone is reached.

### Shareable summary card

Generate a beautiful visual summary of your month — total spent, top categories, streak count — and share it straight to WhatsApp.

---

## Tech Stack

### Frontend

| Layer | Technology |
| --- | --- |
| Framework | React 19 + Vite |
| Language | TypeScript |
| Routing | React Router v7 |
| Styling | Tailwind CSS v4 + CSS Variables |
| Animation | Framer Motion |
| Client state | Zustand |
| Server state | TanStack Query (React Query v5) |
| Charts | Recharts |
| Hosting | Vercel |
| Package manager | pnpm |

### Backend

| Layer | Technology |
| --- | --- |
| Runtime | Node.js (ES modules) |
| Framework | Express 5 |
| Database | PostgreSQL |
| ORM | Prisma 5 (`@prisma/adapter-pg`) |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` |
| OAuth | Google Sign-In (`google-auth-library`) |
| API docs | Swagger (`swagger-jsdoc` + `swagger-ui-express`) |
| Middleware | `cors`, `dotenv` |
| Hosting | Render |

### Money Handling

All amounts are stored and transmitted in **kobo** (integer) to avoid floating-point errors. API responses include both kobo and naira representations for display convenience.

---

## API

**Base URL (production):** `https://spendwise-app-39vv.onrender.com`

**Auth:** JWT bearer token in the `Authorization` header.

### Endpoints
POST  /api/auth/signup              { email, password, fullName }
POST  /api/auth/login               { email, password } → { token, user }
GET   /api/transactions             ?categoryId&category&type&startDate&endDate&page&limit
POST  /api/transactions             { amount (kobo), type, categoryId, description? }
GET   /api/analytics                ?startDate&endDate
GET   /api/analytics/burn-rate      ?days
Full interactive docs available at `/api/docs` (Swagger UI).

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL (local or hosted)

### 1. Clone the repo


git clone https://github.com/Astronomox/spendwise-app.git
cd spendwise-app
2. Backend setup
cd backend
npm install
Create a .env file in backend/:
DATABASE_URL=postgresql://user:password@host:5432/spendwise
JWT_SECRET=your-long-random-secret
GOOGLE_CLIENT_ID=your-google-oauth-client-id
PORT=4000
Run migrations and seed:
npx prisma migrate deploy
npx prisma db seed
npm run dev
3. Frontend setup
cd ../frontend
pnpm install
Create a .env.local file in frontend/:
VITE_API_URL=http://localhost:4000
Run the app:
pnpm dev
Open http://localhost:3000
Database Schema
profiles — user settings, monthly budget, bank preferences
transactions — all income/expense entries (manual + SMS), amounts in kobo
categories — transaction categories (food, transport, bills, etc.)
savings_goals — user savings targets with deadlines
alerts — system-generated spend warnings and streaks
Schema is managed via Prisma migrations in backend/prisma/.
Project Structure
spendwise-app/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.js
│   ├── src/
│   │   ├── routes/        # auth, transactions, analytics
│   │   ├── controllers/
│   │   ├── middleware/    # auth, error handling
│   │   ├── lib/           # prisma client, jwt, google auth
│   │   └── utils/
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        │   ├── layout/        # AppShell, navigation
        │   ├── ui/            # Button, Card, Input, Toast, Icons
        │   ├── charts/        # WeeklyBarChart
        │   ├── dashboard/     # ShareableSummaryCard, TopCategories
        │   ├── logger/        # CategoryPicker, AmountInput
        │   ├── transactions/  # TransactionFeed, TransactionItem, EditModal
        │   └── goals/         # GoalCard, GoalModal
        ├── hooks/             # useTransactions, useGoals, useAlerts, useDashboard
        ├── lib/               # api client, Zustand store, query client, utils
        ├── pages/             # Dashboard, History, Logger, Goals, Alerts, SmsQueue
        │   └── auth/          # Login, Signup, Onboarding
        ├── types/             # TypeScript interfaces
        └── index.css          # Design tokens and global styles
Design System
SpendWise uses a dark navy + green fintech palette with a consistent 8px spacing grid.
Display font — Syne (headings, amounts, brand)
Body font — DM Sans (UI text, descriptions)
Primary colour — #008751 (Nigerian green)
All colours via CSS custom properties — no hardcoded hex in components
Built By
Adeola — Frontend / Full Stack
Semilore — Backend / Data
Oreoluwa — Project Manager
Built in a 14-day sprint. Bismillah.
License
Private repository. All rights reserved.
