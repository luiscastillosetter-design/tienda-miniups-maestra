-- Colores disponibles por producto: [{ "name": "Verde", "hex": "#16A34A" }]
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS colors jsonb DEFAULT '[]'::jsonb;
