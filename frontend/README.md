# SpendWise — Frontend

A premium personal finance tracker built with **Vite + React 18**, styled with **Tailwind CSS** and the **Forge palette** (rusty brown on near-black). Animations via **Framer Motion**, charts via **Recharts**, icons via **Lucide React**.

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Build for production
npm run build

# 4. Preview the production build locally
npm run preview
```

The dev server starts at **http://localhost:5173** by default.

---

## Project structure

```
spendwise-vite/
├── index.html
├── package.json
├── vite.config.js          # path alias: @ → ./src
├── tailwind.config.js      # Forge palette tokens
├── postcss.config.js
└── src/
    ├── main.jsx            # React 18 root
    ├── App.jsx             # BrowserRouter + Routes
    ├── index.css           # Tailwind directives, base styles, custom utilities
    │
    ├── data/
    │   └── mockData.js     # Prototype mock data — swap for API calls
    │
    ├── lib/
    │   ├── utils.js        # cn(), formatNaira(), getTimeAgo(), getGreeting()
    │   └── categories.jsx  # CATEGORIES array + getCategoryById()
    │
    ├── components/
    │   ├── ui/
    │   │   ├── Button.jsx
    │   │   ├── Card.jsx
    │   │   ├── Input.jsx
    │   │   ├── Badge.jsx
    │   │   └── AnimatedNumber.jsx
    │   ├── charts/
    │   │   └── WeeklyBarChart.jsx
    │   ├── layout/
    │   │   └── AppShell.jsx   # Sidebar (desktop) + bottom nav (mobile) + page transitions
    │   ├── transactions/
    │   │   └── TransactionItem.jsx
    │   ├── goals/
    │   │   └── GoalCard.jsx
    │   └── dashboard/
    │       └── TopCategories.jsx
    │
    └── pages/
        ├── Dashboard.jsx
        ├── History.jsx
        ├── Logger.jsx
        ├── Goals.jsx
        ├── Alerts.jsx
        └── auth/
            ├── Login.jsx
            └── Signup.jsx
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

## Connecting to the backend

All data currently comes from `src/data/mockData.js`. To wire up the real backend:

1. **Install a data-fetching library** — [TanStack Query](https://tanstack.com/query) is recommended (already used in the original codebase):
   ```bash
   npm install @tanstack/react-query
   ```

2. **Create API hooks** in `src/hooks/` mirroring the original `useTransactions`, `useDashboard`, `useGoals`, `useAlerts` hooks.

3. **Replace mock imports** in each page with the real hooks, e.g.:
   ```jsx
   // Before
   import { mockTransactions } from '@/data/mockData';

   // After
   import { useTransactions } from '@/hooks/useTransactions';
   const { transactions, isLoading } = useTransactions();
   ```

4. **Add auth** — wire `src/pages/auth/Login.jsx` and `Signup.jsx` to the existing backend auth endpoints, store the JWT in `localStorage` (`sw_token` / `sw_user`), and gate protected routes in `App.jsx` using a Zustand or Context auth store.

---

## Key dependencies

| Package             | Version  | Purpose                              |
|---------------------|----------|--------------------------------------|
| `react`             | 18.3     | UI framework                         |
| `react-router-dom`  | 6.24     | Client-side routing                  |
| `framer-motion`     | 11.3     | Page transitions, micro-interactions |
| `recharts`          | 2.12     | Weekly spend bar chart               |
| `lucide-react`      | 0.408    | Icon set                             |
| `tailwindcss`       | 3.4      | Utility-first CSS                    |
| `vite`              | 5.3      | Build tool + dev server              |
| `@vitejs/plugin-react` | 4.3   | JSX transform + Fast Refresh         |

---

## Available scripts

| Command           | Description                          |
|-------------------|--------------------------------------|
| `npm run dev`     | Start Vite dev server (HMR enabled)  |
| `npm run build`   | Production build → `dist/`           |
| `npm run preview` | Serve the production build locally   |

---

## Deployment

The output of `npm run build` is a static `dist/` folder — deploy to **Vercel**, **Netlify**, or any static host. A `vercel.json` with SPA rewrites is recommended:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
