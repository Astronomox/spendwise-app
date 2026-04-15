export type AlertType = 'high_spend' | 'streak' | 'budget_warning' | 'goal_reached';

export interface Alert {
  id: string;
  user_id: string;
  type: AlertType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}
