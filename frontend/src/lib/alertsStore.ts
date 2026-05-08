// src/lib/alertsStore.ts
// Local alert generation engine — produces alerts from transaction + goal data
// until the backend ships its own alerts endpoint.

import type { Alert, AlertType } from '@/types/alerts';
import type { Transaction } from '@/types/transactions';
import type { Goal } from '@/types/goals';

const STORAGE_KEY = 'sw_alerts';

function generateId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function readAlerts(): Alert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Alert[]) : [];
  } catch {
    return [];
  }
}

function writeAlerts(alerts: Alert[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
}

function hasRecentAlert(alerts: Alert[], type: AlertType, hoursBack = 24): boolean {
  const cutoff = Date.now() - hoursBack * 60 * 60 * 1000;
  return alerts.some(a => a.type === type && new Date(a.createdAt).getTime() > cutoff);
}

// ── Public API ────────────────────────────────────────

export async function fetchAlerts(): Promise<Alert[]> {
  await new Promise(r => setTimeout(r, 150));
  return readAlerts().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function markAlertRead(id: string): Promise<void> {
  const alerts = readAlerts();
  const idx = alerts.findIndex(a => a.id === id);
  if (idx !== -1) {
    alerts[idx].read = true;
    writeAlerts(alerts);
  }
}

export async function markAllRead(): Promise<void> {
  const alerts = readAlerts().map(a => ({ ...a, read: true }));
  writeAlerts(alerts);
}

export async function clearAlerts(): Promise<void> {
  writeAlerts([]);
}

/**
 * Generate smart alerts based on current transaction and goal state.
 * Call this after adding a transaction or deposit.
 */
export function generateSmartAlerts(
  transactions: Transaction[],
  goals: Goal[],
  monthlyBudget: number,
): void {
  const existing = readAlerts();
  const newAlerts: Alert[] = [];
  const now = new Date();

  // ── Budget warnings ──
  if (monthlyBudget > 0) {
    const thisMonth = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() &&
             d.getFullYear() === now.getFullYear() &&
             t.direction === 'debit';
    });
    const totalSpent = thisMonth.reduce((s, t) => s + t.amount, 0);
    const pct = (totalSpent / monthlyBudget) * 100;

    if (pct >= 90 && !hasRecentAlert(existing, 'budget_warning', 48)) {
      newAlerts.push({
        id: generateId(),
        type: 'budget_warning',
        title: '⚠️ Budget almost depleted',
        message: `You've spent ${Math.round(pct)}% of your monthly budget. Consider slowing down.`,
        read: false,
        createdAt: now.toISOString(),
      });
    } else if (pct >= 70 && pct < 90 && !hasRecentAlert(existing, 'budget_warning', 72)) {
      newAlerts.push({
        id: generateId(),
        type: 'budget_warning',
        title: 'Budget check-in',
        message: `${Math.round(pct)}% of your budget is used. You have ${Math.round(100 - pct)}% left for the rest of the month.`,
        read: false,
        createdAt: now.toISOString(),
      });
    }
  }

  // ── High spend detection (2× daily average) ──
  const last7 = transactions.filter(t => {
    const d = new Date(t.date);
    return (now.getTime() - d.getTime()) < 7 * 86_400_000 && t.direction === 'debit';
  });
  if (last7.length > 0) {
    const dailyAvg = last7.reduce((s, t) => s + t.amount, 0) / 7;
    const todaySpend = transactions
      .filter(t => new Date(t.date).toDateString() === now.toDateString() && t.direction === 'debit')
      .reduce((s, t) => s + t.amount, 0);

    if (todaySpend > dailyAvg * 2 && dailyAvg > 0 && !hasRecentAlert(existing, 'high_spend', 12)) {
      newAlerts.push({
        id: generateId(),
        type: 'high_spend',
        title: 'Spending spike detected',
        message: `Today's spending is ${Math.round(todaySpend / dailyAvg)}× your daily average. Stay mindful.`,
        read: false,
        createdAt: now.toISOString(),
      });
    }
  }

  // ── Goal milestones ──
  for (const goal of goals) {
    if (goal.targetAmount <= 0) continue;
    const pct = (goal.currentAmount / goal.targetAmount) * 100;

    if (pct >= 100 && !hasRecentAlert(existing, 'goal_reached', 168)) {
      newAlerts.push({
        id: generateId(),
        type: 'goal_reached',
        title: `🎉 Goal reached: ${goal.name}`,
        message: `You've saved the full target amount. Amazing discipline!`,
        read: false,
        createdAt: now.toISOString(),
      });
    }
  }

  // ── Streak detection (consecutive days logging) ──
  const uniqueDays = new Set(
    transactions
      .filter(t => (now.getTime() - new Date(t.date).getTime()) < 14 * 86_400_000)
      .map(t => new Date(t.date).toDateString())
  );
  let streak = 0;
  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    if (uniqueDays.has(d.toDateString())) streak++;
    else break;
  }
  if (streak >= 7 && !hasRecentAlert(existing, 'streak', 168)) {
    newAlerts.push({
      id: generateId(),
      type: 'streak',
      title: `🔥 ${streak}-day streak!`,
      message: `You've been tracking expenses for ${streak} consecutive days. Keep the momentum!`,
      read: false,
      createdAt: now.toISOString(),
    });
  }

  if (newAlerts.length > 0) {
    writeAlerts([...newAlerts, ...existing].slice(0, 50)); // cap at 50
  }
}
