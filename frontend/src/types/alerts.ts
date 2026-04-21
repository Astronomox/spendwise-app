// src/types/alerts.ts

export type AlertType =
  | 'budget_warning'
  | 'high_spend'
  | 'streak'
  | 'goal_reached';

export interface Alert {
  id:        string;
  type:      AlertType;
  title:     string;
  message:   string;
  read:      boolean;
  /** ISO 8601 date string */
  createdAt: string;
}
