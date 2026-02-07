-- Surgical fix to align database with expected schema from repository migrations

-- 1. Create missing tables
CREATE TABLE IF NOT EXISTS public.banks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_id UUID REFERENCES public.banks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  account_type TEXT DEFAULT 'checking',
  balance DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.goal_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.investment_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investment_id UUID NOT NULL REFERENCES public.investments(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  contribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Update movements table
DO $$ 
BEGIN
  -- Rename occurred_on to date if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movements' AND column_name = 'occurred_on') THEN
    ALTER TABLE public.movements RENAME COLUMN occurred_on TO date;
  END IF;

  -- Add account_id if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movements' AND column_name = 'account_id') THEN
    ALTER TABLE public.movements ADD COLUMN account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL;
  END IF;

  -- Add origin if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movements' AND column_name = 'origin') THEN
    ALTER TABLE public.movements ADD COLUMN origin TEXT DEFAULT 'manual' CHECK (origin IN ('manual', 'voice', 'import'));
  END IF;
END $$;

-- 3. Update goals table
DO $$ 
BEGIN
  -- Rename title to name if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'goals' AND column_name = 'title') THEN
    ALTER TABLE public.goals RENAME COLUMN title TO name;
  END IF;

  -- Add metadata columns if not exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'goals' AND column_name = 'icon') THEN
    ALTER TABLE public.goals ADD COLUMN icon TEXT DEFAULT 'target';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'goals' AND column_name = 'image_url') THEN
    ALTER TABLE public.goals ADD COLUMN image_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'goals' AND column_name = 'is_archived') THEN
    ALTER TABLE public.goals ADD COLUMN is_archived BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'goals' AND column_name = 'updated_at') THEN
    ALTER TABLE public.goals ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
  END IF;
END $$;

-- 4. Update investments table
DO $$ 
BEGIN
  -- Add asset_type if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investments' AND column_name = 'asset_type') THEN
    ALTER TABLE public.investments ADD COLUMN asset_type TEXT NOT NULL DEFAULT 'other' CHECK (asset_type IN ('crypto', 'etf', 'stocks', 'other'));
  END IF;

  -- Add icon if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investments' AND column_name = 'icon') THEN
    ALTER TABLE public.investments ADD COLUMN icon TEXT DEFAULT 'trending-up';
  END IF;

  -- Add updated_at if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investments' AND column_name = 'updated_at') THEN
    ALTER TABLE public.investments ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
  END IF;
END $$;

-- 5. Enable RLS on new tables
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_contributions ENABLE ROW LEVEL SECURITY;

-- 6. Basic RLS Policies (Simplified for now, matching common patterns)
CREATE POLICY IF NOT EXISTS "Users can view their own banks" ON public.banks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can view their own accounts" ON public.accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can view their own goal contributions" ON public.goal_contributions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can view their own investment contributions" ON public.investment_contributions FOR ALL USING (auth.uid() = user_id);
