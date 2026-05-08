# SpendWise Backend — Goals, Alerts, User Profile

## What's in this package

### Backend files (copy to `backend/`)
| File | Action | What it does |
|------|--------|-------------|
| `prisma/schema.prisma` | REPLACE | Adds SavingsGoal, GoalDeposit, Alert models + User fields |
| `controllers/goalsController.js` | NEW | CRUD + deposit for savings goals |
| `controllers/alertsController.js` | NEW | List, mark read, mark all read, clear alerts |
| `controllers/userController.js` | NEW | Profile, budget, onboarding, data export |
| `routes/goalsRoutes.js` | NEW | `/api/goals` endpoints |
| `routes/alertsRoutes.js` | NEW | `/api/alerts` endpoints |
| `routes/userRoutes.js` | NEW | `/api/users` endpoints |
| `server.js` | REPLACE | Registers new routes |

### Frontend files (copy to `frontend/src/`)
| File | Action | What it does |
|------|--------|-------------|
| `frontend-api-additions.ts` | APPEND to `lib/api.ts` | API methods for goals, alerts, users |
| `frontend-useGoals.ts` | REPLACE `hooks/useGoals.ts` | Calls real API instead of localStorage |
| `frontend-useAlerts.ts` | REPLACE `hooks/useAlerts.ts` | Calls real API instead of localStorage |

## Installation steps

### Step 1: Copy backend files

```cmd
cd C:\Users\HomePC\Downloads\spendwise-app
xcopy /y backend-update\prisma\schema.prisma backend\prisma\
xcopy /y backend-update\controllers\goalsController.js backend\controllers\
xcopy /y backend-update\controllers\alertsController.js backend\controllers\
xcopy /y backend-update\controllers\userController.js backend\controllers\
xcopy /y backend-update\routes\goalsRoutes.js backend\routes\
xcopy /y backend-update\routes\alertsRoutes.js backend\routes\
xcopy /y backend-update\routes\userRoutes.js backend\routes\
xcopy /y backend-update\server.js backend\
```

### Step 2: Run Prisma migration

```cmd
cd backend
npx prisma migrate dev --name add-goals-alerts-user-fields
```

This creates the new tables (SavingsGoal, GoalDeposit, Alert) and adds fields to User.

### Step 3: Copy frontend files

```cmd
cd ..\frontend
```

Open `src/lib/api.ts` in VS Code. Scroll to the bottom and paste the entire contents of `frontend-api-additions.ts` at the end.

Then replace the hooks:
```cmd
xcopy /y ..\backend-update\frontend-useGoals.ts src\hooks\useGoals.ts
xcopy /y ..\backend-update\frontend-useAlerts.ts src\hooks\useAlerts.ts
```

### Step 4: Test locally

Start backend:
```cmd
cd ..\backend
npm run dev
```

Start frontend (new terminal):
```cmd
cd ..\frontend
pnpm dev
```

Create a goal, add a deposit, log out, log back in — data should persist.

### Step 5: Deploy

Push to GitHub. Vercel auto-deploys frontend. For backend on Render:
```cmd
cd backend
npx prisma migrate deploy
```

## API endpoints summary

### Goals — `/api/goals`
| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/api/goals` | — | List all goals |
| GET | `/api/goals/:id` | — | Get single goal with deposits |
| POST | `/api/goals` | `{name, targetAmount, deadline, icon}` | Create goal |
| PUT | `/api/goals/:id` | `{name?, targetAmount?, deadline?, icon?}` | Update goal |
| DELETE | `/api/goals/:id` | — | Delete goal |
| POST | `/api/goals/:id/deposit` | `{amount, note?}` | Add deposit |

### Alerts — `/api/alerts`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/alerts` | List alerts (max 50) |
| PUT | `/api/alerts/:id/read` | Mark one as read |
| PUT | `/api/alerts/read-all` | Mark all as read |
| DELETE | `/api/alerts` | Clear all |

### Users — `/api/users`
| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/api/users/me` | — | Get profile + budget |
| PUT | `/api/users/profile` | `{fullName?, email?}` | Update profile |
| PUT | `/api/users/budget` | `{monthlyBudget}` | Set budget (naira) |
| PUT | `/api/users/onboarding` | `{primaryBank?, smsEnabled?}` | Save onboarding |
| GET | `/api/users/export` | — | Export all data as JSON |

All amounts in request bodies are in **naira**. The backend converts to kobo internally. All responses return naira for display.

All endpoints require `Authorization: Bearer <token>` header.
