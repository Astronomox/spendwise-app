export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  target_amount: number;
  current_amount: number;
  deadline: string; // ISO 8601
  created_at: string;
}
