-- Drop the old constraint and add new one with all asset types
ALTER TABLE public.investments DROP CONSTRAINT investments_asset_type_check;

ALTER TABLE public.investments ADD CONSTRAINT investments_asset_type_check 
CHECK (asset_type = ANY (ARRAY['crypto'::text, 'etf'::text, 'stocks'::text, 'bonds'::text, 'real_estate'::text, 'other'::text]));