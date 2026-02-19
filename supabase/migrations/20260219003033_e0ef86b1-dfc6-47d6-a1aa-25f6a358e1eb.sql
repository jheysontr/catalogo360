
ALTER TABLE public.products
ADD COLUMN attributes jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.products.attributes IS 'Array of product attributes like [{name: "Color", values: ["Rojo", "Azul"]}, {name: "Talla", values: ["S", "M", "L"]}]';
