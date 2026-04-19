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

| Layer | Technology |
| --- | --- |
| Frontend | React 19 + Vite |
| Routing | React Router v7 |
| Styling | Tailwind CSS v4 + CSS Variables |
| Animation | Framer Motion |
| State | Zustand |
| Server state | TanStack Query (React Query v5) |
| Charts | Recharts |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Package manager | pnpm |

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- A Supabase project

### 1. Clone the repo

```bash
git clone https://github.com/Astronomox/spendwise-app.git
cd spendwise-app
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-key
```

### 4. Set up the database

Run these SQL migrations in your Supabase SQL Editor in order:

**Tables** — `profiles`, `transactions`, `savings_goals`, `alerts`

**Dashboard RPC** — `supabase/migrations/001_dashboard_summary.sql`

Full migration files are in the `/supabase/migrations` directory.

### 5. Run the app

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Database Schema

profiles         — user settings, monthly budget, bank preferences
transactions     — all income/expense entries (manual + SMS)
savings_goals    — user savings targets with deadlines
alerts           — system-generated spend warnings and streaks

Row Level Security (RLS) is enabled on all tables. Users can only access their own data.

---

## Project Structure

src/
├── components/
│   ├── layout/        # AppShell, navigation
│   ├── ui/            # Button, Card, Input, Toast, Icons
│   ├── charts/        # WeeklyBarChart
│   ├── dashboard/     # ShareableSummaryCard, TopCategories
│   ├── logger/        # CategoryPicker, AmountInput
│   ├── transactions/  # TransactionFeed, TransactionItem, EditModal
│   └── goals/         # GoalCard, GoalModal
├── hooks/             # useTransactions, useGoals, useAlerts, useDashboard
├── lib/               # Supabase client, Zustand store, query client, utils
├── pages/             # Dashboard, History, Logger, Goals, Alerts, SmsQueue
│   └── auth/          # Login, Signup, Onboarding
├── types/             # TypeScript interfaces
└── index.css          # Design tokens and global styles

---

## Design System

SpendWise uses a dark navy + green fintech palette with a consistent 8px spacing grid.

- **Display font** — Syne (headings, amounts, brand)
- **Body font** — DM Sans (UI text, descriptions)
- **Primary colour** — `#008751` (Nigerian green)
- **All colours** via CSS custom properties — no hardcoded hex in components

---

## Built By

**Adeola** — Frontend / Full Stack  
**Semilore** — Backend / Data  
**Wisdom** — Full Stack / SMS Integration  
**Oreoluwa** — Project Manager

Built in a 14-day sprint. Bismillah.

---

## License

Private repository. All rights reserved.
