# SpendWise — Frontend

A premium personal finance tracker built with **Vite + React 18 + TypeScript**, styled with **Tailwind CSS** and the **Forge palette** (rusty brown on near-black). Animations via **Framer Motion**, charts via **Recharts**, icons via **Lucide React**.

---

## Quick start

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env file and set your API URL
cp .env.example .env.local

# 3. Start the dev server
pnpm dev

# 4. Type-check (no emit)
pnpm typecheck

# 5. Build for production
pnpm build

# 6. Preview the production build locally
pnpm preview
```

The dev server starts at **http://localhost:5173** by default.

---

## Project structure

```
frontend/
├── index.html
├── package.json
├── vite.config.ts          # path alias: @ → ./src
├── tsconfig.json           # strict mode, project references
├── tsconfig.node.json      # node-side config (vite.config.ts)
├── tailwind.config.js      # Forge palette tokens
├── postcss.config.js
├── vercel.json             # SPA catch-all rewrite
├── .env.example            # VITE_API_URL placeholder
└── src/
    ├── main.tsx            # React 18 root, QueryClientProvider, ToastContainer
    ├── App.tsx             # BrowserRouter + Routes + PrivateRoute auth guard
    ├── index.css           # Tailwind directives, base styles, custom utilities
    ├── vite-env.d.ts       # Vite client type reference
    │
    ├── types/
    │   ├── transactions.ts # Transaction, TransactionDirection, TransactionSource, TransactionStatus
    │   ├── goals.ts        # Goal, GoalFormValues
    │   ├── alerts.ts       # Alert, AlertType
    │   └── user.ts         # User, DashboardData
    │
    ├── data/
    │   └── mockData.ts     # Prototype mock data — fallback when API is unavailable
    │
    ├── lib/
    │   ├── api.ts          # Typed API client (auth, transactions, analytics)
    │   ├── queryClient.ts  # TanStack Query v5 client configuration
    │   ├── store.ts        # Zustand auth store (persists to localStorage)
    │   ├── utils.ts        # cn(), formatNaira(), getTimeAgo(), getGreeting()
    │   └── categories.tsx  # CATEGORIES array + getCategoryById()
    │
    ├── hooks/
    │   ├── useTransactions.ts  # Query + optimistic mutations for transactions
    │   ├── useDashboard.ts     # Dashboard summary query
    │   ├── useGoals.ts         # Goals CRUD with optimistic updates
    │   └── useAlerts.ts        # Alerts query + mark-read mutation
    │
    ├── components/
    │   ├── ui/
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── Input.tsx
    │   │   ├── Badge.tsx
    │   │   ├── AnimatedNumber.tsx
    │   │   └── Toast.tsx           # Zustand toast store + auto-dismiss UI
    │   ├── charts/
    │   │   └── WeeklyBarChart.tsx
    │   ├── layout/
    │   │   ├── AppShell.tsx        # Sidebar (desktop) + bottom nav (mobile) + page transitions
    │   │   └── AuthLayout.tsx      # Auth page layout wrapper
    │   ├── transactions/
    │   │   ├── TransactionItem.tsx
    │   │   └── EditTransactionModal.tsx
    │   ├── goals/
    │   │   ├── GoalCard.tsx
    │   │   └── GoalModal.tsx
    │   └── dashboard/
    │       └── TopCategories.tsx
    │
    └── pages/
        ├── Dashboard.tsx
        ├── History.tsx
        ├── Logger.tsx
        ├── Goals.tsx
        ├── Alerts.tsx
        ├── SmsQueue.tsx
        ├── Onboarding.tsx
        └── auth/
            ├── Login.tsx
            └── Signup.tsx
```

---

## Design system

### Palette — Forge

| Token              | Value       | Usage                        |
|--------------------|-------------|------------------------------|
| `forge-bg`         | `#0A0908`   | Page background              |
| `forge-surface`    | `#161210`   | Cards, sidebar               |
| `forge-elevated`   | `#211A14`   | Hover states, inputs         |
| `rust`             | `#B7410E`   | Primary accent               |
| `rust-light`       | `#D4541A`   | Gradient start, active text  |
| `rust-dim`         | `#8B3A1D`   | Gradient end, muted accent   |
| `cream`            | `#F5F1EB`   | Primary text                 |
| `success`          | `#2DB37A`   | Credits, completed goals     |
| `danger`           | `#F43F5E`   | Errors, destructive actions  |
| `warning`          | `#FBBF24`   | Budget alerts, streak        |

All tokens are defined in `tailwind.config.js` and available as Tailwind utility classes:
`bg-forge-surface`, `text-rust`, `border-rust/20`, `shadow-rust`, etc.

### Typography

| Role    | Family              | Weight  |
|---------|---------------------|---------|
| Display | Plus Jakarta Sans   | 700–800 |
| Body    | Inter               | 400–600 |

Applied via `font-display` / `font-body` Tailwind utilities (configured in `tailwind.config.js`).

### Custom utilities (index.css)

| Class               | What it does                                          |
|---------------------|-------------------------------------------------------|
| `.glass`            | Dark frosted glass — `rgba(22,18,16,0.80)` + blur    |
| `.skeleton`         | Shimmer loading placeholder                           |
| `.text-gradient-rust` | Rust→dim gradient clipped to text                  |
| `.hero-glow-1/2`    | Radial ambient glows for the hero card               |
| `.input-focus`      | Consistent rust focus ring on inputs                 |

---

## Backend integration

The app uses **TanStack React Query v5** for data fetching and **Zustand** for auth state. All API calls go through `src/lib/api.ts`, which reads `VITE_API_URL` from your `.env.local`.

### Auth flow

1. User signs up or logs in via `/auth/login` or `/auth/signup`
2. JWT token is stored in `localStorage` (`sw_token` / `sw_user`) via the Zustand store (`src/lib/store.ts`)
3. `PrivateRoute` in `App.tsx` checks `isAuthenticated` from the store — unauthenticated users are redirected to `/auth/login`
4. After signup, users are redirected to `/onboarding`

### Data hooks

| Hook               | File                          | Description                              |
|--------------------|-------------------------------|------------------------------------------|
| `useTransactions`  | `src/hooks/useTransactions.ts`| Transactions query + optimistic add      |
| `useDashboard`     | `src/hooks/useDashboard.ts`   | Dashboard summary (budget, spend, etc.)  |
| `useGoals`         | `src/hooks/useGoals.ts`       | Goals CRUD with optimistic local updates |
| `useAlerts`        | `src/hooks/useAlerts.ts`      | Alerts list + mark-as-read mutation      |

Each page falls back to `src/data/mockData.ts` when the API is unavailable or loading, so the UI always renders.

---

## Key dependencies

| Package                  | Version  | Purpose                              |
|--------------------------|----------|--------------------------------------|
| `react`                  | 18.3     | UI framework                         |
| `react-router-dom`       | 6.24     | Client-side routing                  |
| `@tanstack/react-query`  | 5.51     | Data fetching + cache                |
| `zustand`                | 4.5      | Auth state management                |
| `framer-motion`          | 11.3     | Page transitions, micro-interactions |
| `recharts`               | 2.12     | Weekly spend bar chart               |
| `lucide-react`           | 0.408    | Icon set                             |
| `tailwindcss`            | 3.4      | Utility-first CSS                    |
| `typescript`             | 5.5      | Type safety                          |
| `vite`                   | 5.3      | Build tool + dev server              |

---

## Available scripts

| Command            | Description                                    |
|--------------------|------------------------------------------------|
| `pnpm dev`         | Start Vite dev server (HMR enabled)            |
| `pnpm build`       | Type-check + production build → `dist/`        |
| `pnpm preview`     | Serve the production build locally             |
| `pnpm typecheck`   | Run `tsc -b --noEmit` (type-check, no output)  |

---

## Deployment

The output of `pnpm build` is a static `dist/` folder. A `vercel.json` with SPA rewrites is included:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Deploy to **Vercel**, **Netlify**, or any static host. Set `VITE_API_URL` as an environment variable in your hosting platform's dashboard.