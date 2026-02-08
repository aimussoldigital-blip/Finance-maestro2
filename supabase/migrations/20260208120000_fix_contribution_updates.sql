-- Add missing UPDATE policies for contributions
-- This ensures users can edit their contributions, fixing a potential gap in previous migrations

DO $$ 
BEGIN
  -- Goal Contributions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'goal_contributions' 
    AND policyname = 'Users can update their own goal contributions'
  ) THEN
    CREATE POLICY "Users can update their own goal contributions" 
    ON public.goal_contributions 
    FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;

  -- Investment Contributions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'investment_contributions' 
    AND policyname = 'Users can update their own investment contributions'
  ) THEN
    CREATE POLICY "Users can update their own investment contributions" 
    ON public.investment_contributions 
    FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;
END $$;
