// src/lib/milestones.ts
//
// Tracks which milestone (25/50/75/100%) has already been celebrated per goal,
// so we never re-fire confetti for the same threshold.
//
// Persistence is localStorage — when the BE adds a `lastCelebratedMilestone`
// field on the Goal record, swap the storage layer here without touching the
// hook or the overlay component.

const STORAGE_KEY = 'spendwise:goal-milestones';

export type MilestonePct = 25 | 50 | 75 | 100;
export const MILESTONES: readonly MilestonePct[] = [25, 50, 75, 100] as const;

interface Store {
  /** goalId → highest celebrated percent (0 if none) */
  [goalId: string]: number;
}

function read(): Store {
  if (typeof localStorage === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Store;
  } catch {
    return {};
  }
}

function write(store: Store): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch { /* quota / private mode */ }
}

/** Highest milestone already celebrated for this goal (0 if none). */
export function getCelebrated(goalId: string): number {
  return read()[goalId] ?? 0;
}

/** Mark this milestone as celebrated — also clamps lower thresholds. */
export function markCelebrated(goalId: string, percent: number): void {
  const store = read();
  if ((store[goalId] ?? 0) >= percent) return;
  store[goalId] = percent;
  write(store);
}

/** Largest milestone the goal has crossed but not yet celebrated. Returns null if none. */
export function pendingMilestone(goalId: string, currentPct: number): MilestonePct | null {
  const celebrated = getCelebrated(goalId);
  // Find highest threshold that the goal has reached AND we haven't celebrated yet.
  for (let i = MILESTONES.length - 1; i >= 0; i--) {
    const m = MILESTONES[i];
    if (currentPct >= m && celebrated < m) return m;
  }
  return null;
}

/** Reset (e.g. when user deletes a goal). */
export function clearCelebrated(goalId: string): void {
  const store = read();
  delete store[goalId];
  write(store);
}
