-- Drop old kind constraint and add new type constraint
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_kind_check;
ALTER TABLE public.categories ADD CONSTRAINT categories_type_check CHECK (type IN ('expense', 'income', 'saving'));
