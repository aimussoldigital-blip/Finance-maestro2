-- Add triggers and functions to maintain data integrity

-- 1. Function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 2. Triggers for timestamp updates
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_goals_updated_at ON public.goals;
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_investments_updated_at ON public.investments;
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON public.investments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Trigger to update goal current_amount when contribution is added
CREATE OR REPLACE FUNCTION public.update_goal_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.goals SET current_amount = current_amount + NEW.amount WHERE id = NEW.goal_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.goals SET current_amount = current_amount - OLD.amount WHERE id = OLD.goal_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS update_goal_on_contribution ON public.goal_contributions;
CREATE TRIGGER update_goal_on_contribution
  AFTER INSERT OR DELETE ON public.goal_contributions
  FOR EACH ROW EXECUTE FUNCTION public.update_goal_amount();

-- 4. Trigger to update investment current_value when contribution is added
CREATE OR REPLACE FUNCTION public.update_investment_value()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.investments SET current_value = current_value + NEW.amount WHERE id = NEW.investment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.investments SET current_value = current_value - OLD.amount WHERE id = OLD.investment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS update_investment_on_contribution ON public.investment_contributions;
CREATE TRIGGER update_investment_on_contribution
  AFTER INSERT OR DELETE ON public.investment_contributions
  FOR EACH ROW EXECUTE FUNCTION public.update_investment_value();
