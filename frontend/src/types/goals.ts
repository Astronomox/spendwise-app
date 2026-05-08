// src/types/goals.ts

export interface Goal {
  id:            string;
  name:          string;
  targetAmount:  number;
  currentAmount: number;
  /** ISO 8601 date string */
  deadline:      string;
  /** Maps to a CATEGORIES id — used to pick the icon */
  icon:          string;
  userId:        string;
  /** Deposit history (local-only until BE ships) */
  deposits:      GoalDeposit[];
}

export interface GoalDeposit {
  id:        string;
  amount:    number;
  date:      string;
  note?:     string;
}

/** Shape accepted by the create / edit form */
export interface GoalFormValues {
  name:         string;
  targetAmount: number;
  deadline:     string;
  icon:         string;
}

/** Milestones for progress visualization */
export interface GoalMilestone {
  label:   string;
  percent: number;
  reached: boolean;
}
