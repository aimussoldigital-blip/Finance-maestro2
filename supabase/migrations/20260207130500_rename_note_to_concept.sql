-- Rename column 'note' to 'concept' in movements table to match the application code
ALTER TABLE public.movements RENAME COLUMN note TO concept;
