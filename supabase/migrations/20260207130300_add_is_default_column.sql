-- Add missing is_default column to categories table
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;
