// src/lib/goalsStore.ts
// Local-only persistence layer for savings goals.
// Swap this out for real API calls once backend ships the endpoints.

import type { Goal, GoalDeposit, GoalFormValues } from '@/types/goals';

const STORAGE_KEY = 'sw_goals';

function generateId(): string {
  return `goal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function readGoals(): Goal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Goal[]) : [];
  } catch {
    return [];
  }
}

function writeGoals(goals: Goal[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

// ── CRUD ──────────────────────────────────────────────

export async function fetchGoals(): Promise<Goal[]> {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 300));
  return readGoals();
}

export async function createGoal(values: GoalFormValues): Promise<Goal> {
  await new Promise(r => setTimeout(r, 200));
  const goals = readGoals();
  const newGoal: Goal = {
    id:            generateId(),
    name:          values.name,
    targetAmount:  values.targetAmount,
    currentAmount: 0,
    deadline:      values.deadline,
    icon:          values.icon,
    userId:        'local',
    deposits:      [],
  };
  goals.push(newGoal);
  writeGoals(goals);
  return newGoal;
}

export async function updateGoalApi(
  id: string,
  updates: Partial<GoalFormValues>,
): Promise<Goal> {
  await new Promise(r => setTimeout(r, 200));
  const goals = readGoals();
  const idx = goals.findIndex(g => g.id === id);
  if (idx === -1) throw new Error('Goal not found');
  goals[idx] = { ...goals[idx], ...updates };
  writeGoals(goals);
  return goals[idx];
}

export async function deleteGoalApi(id: string): Promise<void> {
  await new Promise(r => setTimeout(r, 200));
  const goals = readGoals().filter(g => g.id !== id);
  writeGoals(goals);
}

export async function depositToGoal(
  goalId: string,
  amount: number,
  note?: string,
): Promise<Goal> {
  await new Promise(r => setTimeout(r, 200));
  const goals = readGoals();
  const idx = goals.findIndex(g => g.id === goalId);
  if (idx === -1) throw new Error('Goal not found');

  const deposit: GoalDeposit = {
    id:     `dep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    amount,
    date:   new Date().toISOString(),
    note,
  };

  goals[idx].deposits.push(deposit);
  goals[idx].currentAmount += amount;
  writeGoals(goals);
  return goals[idx];
}

export async function getGoalById(id: string): Promise<Goal | null> {
  await new Promise(r => setTimeout(r, 150));
  const goals = readGoals();
  return goals.find(g => g.id === id) ?? null;
}
