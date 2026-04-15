export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  icon: string; // The prompt calls for "emoji picker" replaced by SVG grid. Let's just use string to store an ID.
  target_amount: number;
  current_amount: number;
  deadline: string; // ISO 8601
  created_at: string;
}
