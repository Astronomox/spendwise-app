-- supabase/migrations/001_dashboard_summary.sql

CREATE OR REPLACE FUNCTION get_dashboard_summary()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  v_user_id uuid;
  v_monthly_budget numeric;
  v_total_spent numeric;
  v_budget_remaining numeric;
  v_days_left_in_month int;
  v_daily_safe_spend numeric;
  v_weekly_spend json;
  v_spend_by_category json;
  v_streak_count int;
  v_current_date date;
  v_start_of_month date;
  v_end_of_month date;
BEGIN
  -- Get the authenticated user
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_current_date := CURRENT_DATE;
  v_start_of_month := date_trunc('month', v_current_date)::date;
  v_end_of_month := (date_trunc('month', v_current_date) + interval '1 month - 1 day')::date;
  v_days_left_in_month := v_end_of_month - v_current_date;
  IF v_days_left_in_month < 1 THEN
    v_days_left_in_month := 1;
  END IF;

  -- Get monthly budget from profiles table
  SELECT monthly_budget INTO v_monthly_budget
  FROM public.profiles
  WHERE id = v_user_id;

  IF v_monthly_budget IS NULL THEN
    v_monthly_budget := 0;
  END IF;

  -- Total spent this month
  SELECT COALESCE(SUM(amount), 0) INTO v_total_spent
  FROM public.transactions
  WHERE user_id = v_user_id
    AND date >= v_start_of_month
    AND date <= v_end_of_month
    AND direction = 'debit'
    AND status = 'confirmed';

  v_budget_remaining := v_monthly_budget - v_total_spent;

  -- Daily safe spend
  IF v_budget_remaining > 0 THEN
    v_daily_safe_spend := v_budget_remaining / v_days_left_in_month;
  ELSE
    v_daily_safe_spend := 0;
  END IF;

  -- Spend by category this month
  SELECT json_object_agg(category, total) INTO v_spend_by_category
  FROM (
    SELECT category, COALESCE(SUM(amount), 0) as total
    FROM public.transactions
    WHERE user_id = v_user_id
      AND date >= v_start_of_month
      AND date <= v_end_of_month
      AND direction = 'debit'
      AND status = 'confirmed'
    GROUP BY category
  ) subq;

  IF v_spend_by_category IS NULL THEN
    v_spend_by_category := '{}'::json;
  END IF;

  -- Weekly spend (last 7 days, Mon-Sun style array of 7 numbers)
  -- We'll aggregate sum for the last 7 days.
  -- To make it simple, we return an array of 7 numbers for the last 7 days.
  SELECT json_agg(COALESCE(daily_total, 0)) INTO v_weekly_spend
  FROM (
    SELECT generate_series(CURRENT_DATE - interval '6 days', CURRENT_DATE, interval '1 day')::date as d
  ) days
  LEFT JOIN (
    SELECT date::date as t_date, SUM(amount) as daily_total
    FROM public.transactions
    WHERE user_id = v_user_id
      AND date >= CURRENT_DATE - interval '6 days'
      AND direction = 'debit'
      AND status = 'confirmed'
    GROUP BY date::date
  ) tx ON days.d = tx.t_date
  ORDER BY days.d ASC;

  IF v_weekly_spend IS NULL THEN
    v_weekly_spend := '[0,0,0,0,0,0,0]'::json;
  END IF;

  -- Calculate streak count (consecutive days with at least one transaction up to yesterday/today)
  WITH dates AS (
    SELECT DISTINCT date::date as t_date
    FROM public.transactions
    WHERE user_id = v_user_id
      AND status = 'confirmed'
      AND date <= CURRENT_DATE
    ORDER BY date::date DESC
  ),
  streak_calc AS (
    SELECT t_date,
           CURRENT_DATE - t_date as days_ago,
           ROW_NUMBER() OVER (ORDER BY t_date DESC) - 1 as expected_days_ago
    FROM dates
  )
  SELECT COUNT(*) INTO v_streak_count
  FROM streak_calc
  WHERE days_ago = expected_days_ago;

  -- Build final JSON
  result := json_build_object(
    'total_spent', v_total_spent,
    'monthly_budget', v_monthly_budget,
    'budget_remaining', v_budget_remaining,
    'days_left_in_month', v_days_left_in_month,
    'daily_safe_spend', v_daily_safe_spend,
    'weekly_spend', v_weekly_spend,
    'spend_by_category', v_spend_by_category,
    'streak_count', v_streak_count
  );

  RETURN result;
END;
$$;
