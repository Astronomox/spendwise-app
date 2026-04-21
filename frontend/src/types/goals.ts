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
}

/** Shape accepted by the create / edit form */
export type GoalFormValues = Pick<Goal, 'name' | 'targetAmount'>;
