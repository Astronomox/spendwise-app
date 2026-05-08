// src/hooks/useMilestoneWatcher.ts
//
// Watches a goal's progress and surfaces a celebration when a 25/50/75/100%
// threshold is crossed for the first time. Persistence lives in
// `lib/milestones.ts`; this hook only owns the "is the modal open right now"
// piece of state.
//
// Usage:
//   const m = useMilestoneWatcher(goal);
//   <MilestoneCelebration {...m} goalName={goal.name} amount={goal.currentAmount} />

import { useEffect, useState, useCallback } from 'react';
import {
  pendingMilestone,
  markCelebrated,
  type MilestonePct,
} from '@/lib/milestones';
import type { Goal } from '@/types/goals';

export interface UseMilestoneWatcherResult {
  isOpen:    boolean;
  milestone: MilestonePct;
  onClose:   () => void;
  /** Force-close without marking — useful for tests / debug. */
  dismiss:   () => void;
}

export function useMilestoneWatcher(goal: Goal | null | undefined): UseMilestoneWatcherResult {
  const [active, setActive] = useState<MilestonePct | null>(null);

  useEffect(() => {
    if (!goal || goal.targetAmount <= 0) return;
    const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
    const pending = pendingMilestone(goal.id, pct);
    if (pending && pending !== active) {
      // Tiny delay so it lands AFTER the deposit toast / progress bar tween.
      const t = setTimeout(() => setActive(pending), 600);
      return () => clearTimeout(t);
    }
  }, [goal?.id, goal?.currentAmount, goal?.targetAmount, active]);

  const onClose = useCallback(() => {
    if (active && goal) markCelebrated(goal.id, active);
    setActive(null);
  }, [active, goal]);

  const dismiss = useCallback(() => setActive(null), []);

  return {
    isOpen:    active !== null,
    milestone: (active ?? 25) as MilestonePct,
    onClose,
    dismiss,
  };
}
