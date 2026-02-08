-- Rename column 'kind' to 'type' in categories table to match the application code
ALTER TABLE public.categories RENAME COLUMN kind TO type;
