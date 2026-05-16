-- ============================================================
-- ORBITCONTROL — Datos reales de una heladería en Málaga
-- 6 proveedores · 100 productos · 25 recetas · 25 helados
-- Ejecutar en una base de datos vacía (después del schema.sql
-- y antes de arrancar la app por primera vez).
-- ============================================================

-- ============================================================
-- PROVEEDORES
-- ============================================================
INSERT INTO proveedores (nombre, nif, telefono, email, direccion, tipo_producto, activo) VALUES
  ('Grimasur S.A.',            'B29100001', '952201100', 'pedidos@grimasur.es',       'Polígono Ind. La Huertecilla, C/ Heladero 12, Málaga',   'OBRADOR', TRUE),
  ('Comprital España S.L.',    'B28901234', '912345678', 'ventas@comprital.es',        'Av. de la Industria 88, Alcobendas, Madrid',             'OBRADOR', TRUE),
  ('Fabri Gelato S.A.',        'B08567890', '932101010', 'orders@fabrigelato.com',     'C/ Pallars 193, Barcelona',                              'OBRADOR', TRUE),
  ('Lácteos del Sur S.A.',     'A29234567', '957400200', 'lacteos@lacteossur.es',      'Ctra. Córdoba-Málaga km 42, Antequera',                  'OBRADOR', TRUE),
  ('SolHielo Packaging S.L.',  'B29345678', '952700800', 'info@solhielo.es',           'Polígono Ind. El Viso, C/ Frío 4, Málaga',               'TIENDA',  TRUE),
  ('Mercafruta Málaga S.L.',   'B29456789', '952840050', 'compras@mercafruta.es',      'Mercado Central de Mayoristas, Nave 14, Málaga',         'OBRADOR', TRUE);

-- ============================================================
-- PRODUCTOS (100)
-- Los IDs dependen del AUTO_INCREMENT; ajusta si hace falta.
-- Formato: (nombre, precio, unidad_medida, stock_actual,
--           stock_minimo, tipo_producto, envase,
--           contenido_por_unidad, id_proveedor)
-- ============================================================

-- ── Lácteos (10) ────────────────────────────────────────────
INSERT INTO productos (nombre, precio, unidad_medida, stock_actual, stock_minimo, tipo_producto, envase, contenido_por_unidad, id_proveedor) VALUES
  ('Leche entera fresca',              0.72, 'LITRO',     120.0,  40.0, 'OBRADOR', 'BOTELLA', 1.0,  4),
  ('Leche desnatada en polvo',         5.80, 'KILOGRAMO',  25.0,  10.0, 'OBRADOR', 'BOLSA',   1.0,  4),
  ('Nata 35% M.G.',                    2.10, 'LITRO',      60.0,  20.0, 'OBRADOR', 'BOTELLA', 1.0,  4),
  ('Nata 18% M.G.',                    1.55, 'LITRO',      30.0,  10.0, 'OBRADOR', 'BOTELLA', 1.0,  4),
  ('Mantequilla sin sal',              7.20, 'KILOGRAMO',  10.0,   4.0, 'OBRADOR', 'CAJA',    1.0,  4),
  ('Queso mascarpone',                 8.90, 'KILOGRAMO',   8.0,   3.0, 'OBRADOR', 'BOTE',    0.5,  4),
  ('Yogur natural entero (bulk)',      1.20, 'KILOGRAMO',  15.0,   5.0, 'OBRADOR', 'BOTE',    1.0,  4),
  ('Leche condensada azucarada',       3.40, 'KILOGRAMO',  12.0,   4.0, 'OBRADOR', 'BOTE',    1.0,  4),
  ('Suero de leche en polvo',          3.10, 'KILOGRAMO',  10.0,   3.0, 'OBRADOR', 'BOLSA',   1.0,  4),
  ('Crema de queso para helado',       9.50, 'KILOGRAMO',   6.0,   2.0, 'OBRADOR', 'BOTE',    0.5,  4);

-- ── Edulcorantes y azúcares (8) ─────────────────────────────
INSERT INTO productos (nombre, precio, unidad_medida, stock_actual, stock_minimo, tipo_producto, envase, contenido_por_unidad, id_proveedor) VALUES
  ('Azúcar blanquilla',               0.85, 'KILOGRAMO', 200.0,  50.0, 'OBRADOR', 'SACO',   25.0, 1),
  ('Dextrosa monohidrato',            1.40, 'KILOGRAMO',  80.0,  25.0, 'OBRADOR', 'SACO',   25.0, 1),
  ('Trehalosa',                       4.20, 'KILOGRAMO',  20.0,   8.0, 'OBRADOR', 'BOLSA',   5.0, 1),
  ('Glucosa líquida DE40',            1.10, 'KILOGRAMO',  60.0,  20.0, 'OBRADOR', 'BOTE',    5.0, 1),
  ('Azúcar invertido',                1.30, 'KILOGRAMO',  40.0,  15.0, 'OBRADOR', 'BOTE',    5.0, 1),
  ('Fructosa cristalina',             2.80, 'KILOGRAMO',  15.0,   5.0, 'OBRADOR', 'BOLSA',   1.0, 1),
  ('Azúcar moreno de caña',           1.20, 'KILOGRAMO',  30.0,  10.0, 'OBRADOR', 'BOLSA',   1.0, 1),
  ('Miel de azahar malagueña',        6.50, 'KILOGRAMO',   8.0,   2.0, 'OBRADOR', 'BOTE',    1.0, 6);

-- ── Estabilizantes y emulsionantes (6) ──────────────────────
INSERT INTO productos (nombre, precio, unidad_medida, stock_actual, stock_minimo, tipo_producto, envase, contenido_por_unidad, id_proveedor) VALUES
  ('Neutro para helado cremoso 50',   12.50, 'KILOGRAMO',  10.0,  3.0, 'OBRADOR', 'BOLSA',   1.0, 1),
  ('Neutro para sorbete',             11.80, 'KILOGRAMO',   8.0,  2.0, 'OBRADOR', 'BOLSA',   1.0, 1),
  ('Lecitina de soja',                 6.20, 'KILOGRAMO',   5.0,  2.0, 'OBRADOR', 'BOLSA',   1.0, 1),
  ('Mono y diglicéridos (emulgente)',  8.40, 'KILOGRAMO',   4.0,  1.0, 'OBRADOR', 'BOLSA',   1.0, 1),
  ('Goma xantana',                    18.00, 'KILOGRAMO',   3.0,  1.0, 'OBRADOR', 'BOLSA',   0.5, 1),
  ('Carragenato kappa',               22.00, 'KILOGRAMO',   2.0,  0.5, 'OBRADOR', 'BOLSA',   0.5, 1);

-- ── Pastas de sabor (18) ─────────────────────────────────────
INSERT INTO productos (nombre, precio, unidad_medida, stock_actual, stock_minimo, tipo_producto, envase, contenido_por_unidad, id_proveedor) VALUES
  ('Pasta de pistacho siciliano 100%', 68.00, 'KILOGRAMO',  4.0,  1.0, 'OBRADOR', 'BOTE',    1.0, 2),
  ('Pasta de avellana tostada 100%',   42.00, 'KILOGRAMO',  6.0,  2.0, 'OBRADOR', 'BOTE',    1.0, 2),
  ('Pasta de almendra marcona 100%',   38.00, 'KILOGRAMO',  5.0,  2.0, 'OBRADOR', 'BOTE',    1.0, 2),
  ('Pasta de coco premium',            24.00, 'KILOGRAMO',  4.0,  1.0, 'OBRADOR', 'BOTE',    1.0, 2),
  ('Pasta de limón natural',           22.00, 'KILOGRAMO',  5.0,  1.5, 'OBRADOR', 'BOTE',    1.0, 2),
  ('Pasta de fresa',                   20.00, 'KILOGRAMO',  5.0,  2.0, 'OBRADOR', 'BOTE',    1.0, 2),
  ('Pasta de mango',                   26.00, 'KILOGRAMO',  3.0,  1.0, 'OBRADOR', 'BOTE',    1.0, 2),
  ('Pasta de maracuyá',                28.00, 'KILOGRAMO',  3.0,  1.0, 'OBRADOR', 'BOTE',    1.0, 2),
  ('Pasta de café espresso',           32.00, 'KILOGRAMO',  3.0,  1.0, 'OBRADOR', 'BOTE',    1.0, 2),
  ('Pasta de turrón de Málaga',        45.00, 'KILOGRAMO',  3.0,  1.0, 'OBRADOR', 'BOTE',    1.0, 2),
  ('Pasta de caramelo salado',         28.00, 'KILOGRAMO',  3.0,  1.0, 'OBRADOR', 'BOTE',    1.0, 2),
  ('Pasta de tiramisú',                30.00, 'KILOGRAMO',  2.0,  1.0, 'OBRADOR', 'BOTE',    1.0, 2),
  ('Pasta de menta piperita',          26.00, 'KILOGRAMO',  2.0,  0.5, 'OBRADOR', 'BOTE',    1.0, 2),
  ('Pasta de dulce de leche',          22.00, 'KILOGRAMO',  4.0,  1.5, 'OBRADOR', 'BOTE',    1.0, 2),
  ('Pasta de vainilla Bourbon',        95.00, 'KILOGRAMO',  3.0,  1.0, 'OBRADOR', 'BOTE',    1.0, 3),
  ('Pasta de melocotón de Vélez',      24.00, 'KILOGRAMO',  3.0,  1.0, 'OBRADOR', 'BOTE',    1.0, 2),
  ('Pasta de frambuesa',               26.00, 'KILOGRAMO',  3.0,  1.0, 'OBRADOR', 'BOTE',    1.0, 2),
  ('Pasta de moscatel de Málaga',      30.00, 'KILOGRAMO',  2.0,  0.5, 'OBRADOR', 'BOTE',    1.0, 2);

-- ── Chocolates y cacao (6) ───────────────────────────────────
INSERT INTO productos (nombre, precio, unidad_medida, stock_actual, stock_minimo, tipo_producto, envase, contenido_por_unidad, id_proveedor) VALUES
  ('Cacao en polvo 22-24% grasa',      8.50, 'KILOGRAMO', 20.0,  6.0, 'OBRADOR', 'BOTE',    1.0, 3),
  ('Cobertura chocolate negro 70%',   14.00, 'KILOGRAMO', 15.0,  5.0, 'OBRADOR', 'BOLSA',   2.5, 3),
  ('Cobertura chocolate blanco',      12.00, 'KILOGRAMO', 10.0,  3.0, 'OBRADOR', 'BOLSA',   2.5, 3),
  ('Cobertura chocolate con leche',   11.00, 'KILOGRAMO', 10.0,  3.0, 'OBRADOR', 'BOLSA',   2.5, 3),
  ('Masa de cacao pura',              18.00, 'KILOGRAMO',  6.0,  2.0, 'OBRADOR', 'BOLSA',   1.0, 3),
  ('Virutas de chocolate negro',       9.00, 'KILOGRAMO',  5.0,  2.0, 'AMBOS',   'BOLSA',   1.0, 3);

-- ── Frutas y pulpas (14) ─────────────────────────────────────
INSERT INTO productos (nombre, precio, unidad_medida, stock_actual, stock_minimo, tipo_producto, envase, contenido_por_unidad, id_proveedor) VALUES
  ('Pulpa de fresa 90% congelada',    5.20, 'KILOGRAMO', 30.0, 10.0, 'OBRADOR', 'BOLSA',  1.0, 3),
  ('Pulpa de mango 90% congelada',    5.80, 'KILOGRAMO', 20.0,  8.0, 'OBRADOR', 'BOLSA',  1.0, 3),
  ('Pulpa de maracuyá congelada',     6.40, 'KILOGRAMO', 12.0,  4.0, 'OBRADOR', 'BOLSA',  1.0, 3),
  ('Pulpa de frambuesa congelada',    7.20, 'KILOGRAMO', 10.0,  3.0, 'OBRADOR', 'BOLSA',  1.0, 3),
  ('Pulpa de melocotón congelada',    4.90, 'KILOGRAMO', 10.0,  3.0, 'OBRADOR', 'BOLSA',  1.0, 3),
  ('Limones de Málaga (malla 5kg)',   1.80, 'KILOGRAMO', 25.0, 10.0, 'OBRADOR', 'BOLSA',  5.0, 6),
  ('Fresas frescas de Huelva',        3.20, 'KILOGRAMO', 15.0,  5.0, 'OBRADOR', 'CAJA',   4.0, 6),
  ('Mangos maduros frescos',          2.90, 'KILOGRAMO', 10.0,  4.0, 'OBRADOR', 'CAJA',   5.0, 6),
  ('Sandías de Almería',              0.65, 'KILOGRAMO', 60.0, 20.0, 'OBRADOR', 'UNIDAD', 8.0, 6),
  ('Pasas de Málaga moscatel',        8.50, 'KILOGRAMO',  8.0,  2.0, 'OBRADOR', 'BOLSA',  0.5, 6),
  ('Cerezas confitadas',             12.00, 'KILOGRAMO',  5.0,  1.5, 'AMBOS',   'BOTE',   1.0, 3),
  ('Higos secos malagueños',          9.00, 'KILOGRAMO',  5.0,  1.5, 'OBRADOR', 'BOLSA',  0.5, 6),
  ('Plátanos de Canarias',            1.60, 'KILOGRAMO', 10.0,  3.0, 'OBRADOR', 'CAJA',  18.0, 6),
  ('Cocos frescos enteros',           2.20, 'UNIDAD',    15.0,  5.0, 'OBRADOR', 'UNIDAD', 1.0, 6);

-- ── Frutos secos y semillas (8) ──────────────────────────────
INSERT INTO productos (nombre, precio, unidad_medida, stock_actual, stock_minimo, tipo_producto, envase, contenido_por_unidad, id_proveedor) VALUES
  ('Almendra marcona cruda pelada',  14.00, 'KILOGRAMO', 20.0,  6.0, 'OBRADOR', 'BOLSA', 1.0, 1),
  ('Almendra marcona tostada',       15.50, 'KILOGRAMO', 12.0,  4.0, 'AMBOS',   'BOLSA', 1.0, 1),
  ('Pistacho pelado sin sal',        28.00, 'KILOGRAMO',  8.0,  2.0, 'OBRADOR', 'BOLSA', 1.0, 1),
  ('Avellana entera tostada',        12.00, 'KILOGRAMO', 10.0,  3.0, 'OBRADOR', 'BOLSA', 1.0, 1),
  ('Nuez pelada en mitades',         14.00, 'KILOGRAMO',  8.0,  2.0, 'AMBOS',   'BOLSA', 0.5, 1),
  ('Chufa valenciana extra',          7.50, 'KILOGRAMO', 10.0,  3.0, 'OBRADOR', 'BOLSA', 1.0, 6),
  ('Praliné de avellana 50%',        24.00, 'KILOGRAMO',  5.0,  2.0, 'OBRADOR', 'BOTE',  1.0, 3),
  ('Granillo de almendra tostado',    9.00, 'KILOGRAMO',  8.0,  3.0, 'AMBOS',   'BOLSA', 1.0, 1);

-- ── Otros ingredientes secos (7) ─────────────────────────────
INSERT INTO productos (nombre, precio, unidad_medida, stock_actual, stock_minimo, tipo_producto, envase, contenido_por_unidad, id_proveedor) VALUES
  ('Yema de huevo pasteurizada',       6.40, 'KILOGRAMO',  8.0,  3.0, 'OBRADOR', 'BOTE',  1.0, 4),
  ('Clara de huevo pasteurizada',      3.20, 'KILOGRAMO',  5.0,  2.0, 'OBRADOR', 'BOTE',  1.0, 4),
  ('Maltodextrina DE19',               2.10, 'KILOGRAMO', 15.0,  5.0, 'OBRADOR', 'BOLSA', 1.0, 1),
  ('Almidón de maíz (Maizena)',        2.40, 'KILOGRAMO', 10.0,  3.0, 'OBRADOR', 'BOLSA', 1.0, 1),
  ('Sal marina fina de Málaga',        0.60, 'KILOGRAMO',  5.0,  1.0, 'OBRADOR', 'BOLSA', 1.0, 6),
  ('Bicarbonato sódico alimentario',   1.10, 'KILOGRAMO',  3.0,  1.0, 'OBRADOR', 'BOLSA', 1.0, 1),
  ('Coco rallado fino',                5.50, 'KILOGRAMO',  6.0,  2.0, 'AMBOS',   'BOLSA', 0.5, 1);

-- ── Alcohol, licores y aromas (7) ────────────────────────────
INSERT INTO productos (nombre, precio, unidad_medida, stock_actual, stock_minimo, tipo_producto, envase, contenido_por_unidad, id_proveedor) VALUES
  ('Ron añejo Barceló (70cl)',          12.00, 'LITRO',    6.0, 2.0, 'OBRADOR', 'BOTELLA', 0.7, 6),
  ('Vino dulce Málaga D.O.',            8.50, 'LITRO',    4.0, 1.0, 'OBRADOR', 'BOTELLA', 0.75,6),
  ('Amaretto di Saronno (50cl)',        11.00, 'LITRO',   3.0, 1.0, 'OBRADOR', 'BOTELLA', 0.5, 6),
  ('Kahlúa licor de café (70cl)',       14.00, 'LITRO',   3.0, 1.0, 'OBRADOR', 'BOTELLA', 0.7, 6),
  ('Esencia de vainilla natural',       28.00, 'LITRO',   2.0, 0.5, 'OBRADOR', 'BOTELLA', 0.25,2),
  ('Agua de azahar malagueña',           4.50, 'LITRO',   3.0, 1.0, 'OBRADOR', 'BOTELLA', 0.5, 6),
  ('Extracto de café concentrado',      18.00, 'LITRO',   2.0, 0.5, 'OBRADOR', 'BOTELLA', 0.5, 6);

-- ── Packaging y desechables (17) ─────────────────────────────
INSERT INTO productos (nombre, precio, unidad_medida, stock_actual, stock_minimo, tipo_producto, envase, contenido_por_unidad, id_proveedor) VALUES
  ('Cucurucho pequeño 90mm (caja/200)',  4.20, 'UNIDAD',  600.0, 200.0, 'TIENDA', 'CAJA',  200.0, 5),
  ('Cucurucho mediano 110mm (caja/200)', 5.10, 'UNIDAD',  400.0, 200.0, 'TIENDA', 'CAJA',  200.0, 5),
  ('Cucurucho grande 130mm (caja/100)',  6.30, 'UNIDAD',  300.0, 100.0, 'TIENDA', 'CAJA',  100.0, 5),
  ('Cucurucho waffle crujiente (100u)',  8.50, 'UNIDAD',  200.0,  50.0, 'TIENDA', 'CAJA',  100.0, 5),
  ('Paleta de madera 10cm (500u)',       3.20, 'UNIDAD',  500.0, 200.0, 'TIENDA', 'CAJA',  500.0, 5),
  ('Tarrina 100ml + tapa (caja/100)',    5.80, 'UNIDAD',  300.0, 100.0, 'TIENDA', 'CAJA',  100.0, 5),
  ('Tarrina 250ml + tapa (caja/100)',    7.20, 'UNIDAD',  200.0, 100.0, 'TIENDA', 'CAJA',  100.0, 5),
  ('Tarrina 500ml + tapa (caja/50)',     8.90, 'UNIDAD',  150.0,  50.0, 'TIENDA', 'CAJA',   50.0, 5),
  ('Tarrina 1L + tapa (caja/20)',        9.50, 'UNIDAD',  100.0,  40.0, 'TIENDA', 'CAJA',   20.0, 5),
  ('Bañera 2.5L (caja/6)',              12.00, 'UNIDAD',   60.0,  12.0, 'TIENDA', 'CAJA',    6.0, 5),
  ('Bañera 5L (caja/4)',                16.00, 'UNIDAD',   40.0,   8.0, 'TIENDA', 'CAJA',    4.0, 5),
  ('Bolsa kraft 500g (rollo/100)',        4.10, 'UNIDAD',  300.0, 100.0, 'TIENDA', 'CAJA',  100.0, 5),
  ('Bolsa kraft 1kg (rollo/100)',         5.20, 'UNIDAD',  200.0, 100.0, 'TIENDA', 'CAJA',  100.0, 5),
  ('Cuchara mini degustación (100u)',    2.40, 'UNIDAD',  500.0, 200.0, 'TIENDA', 'CAJA',  100.0, 5),
  ('Servilleta blanca (paquete/500)',    3.10, 'UNIDAD',   20.0,   5.0, 'TIENDA', 'CAJA',  500.0, 5),
  ('Papel film alimentario (300m)',      8.50, 'UNIDAD',    8.0,   2.0, 'AMBOS',  'CAJA',    1.0, 5),
  ('Papel sulfurizado 40x60 (250h)',     6.20, 'UNIDAD',    6.0,   2.0, 'AMBOS',  'CAJA',    1.0, 5);

-- ── Decoraciones y toppings (6) ──────────────────────────────
INSERT INTO productos (nombre, precio, unidad_medida, stock_actual, stock_minimo, tipo_producto, envase, contenido_por_unidad, id_proveedor) VALUES
  ('Sprinkles de colores festivos',    8.20, 'KILOGRAMO',  3.0, 1.0, 'TIENDA', 'BOTE', 0.5, 5),
  ('Galleta tipo Oreo triturada',      6.80, 'KILOGRAMO',  4.0, 1.5, 'TIENDA', 'BOLSA',1.0, 3),
  ('Caramelo en polvo dorado',         9.50, 'KILOGRAMO',  3.0, 1.0, 'TIENDA', 'BOTE', 0.5, 3),
  ('Sirope de fresa (topping)',         3.80, 'LITRO',      8.0, 3.0, 'TIENDA', 'BOTELLA',1.0, 3),
  ('Sirope de chocolate (topping)',     4.10, 'LITRO',      8.0, 3.0, 'TIENDA', 'BOTELLA',1.0, 3),
  ('Nata montada en spray (400ml)',     2.90, 'UNIDAD',    24.0, 6.0, 'TIENDA', 'BOTE', 0.4, 4);

-- ============================================================
-- RECETAS (25 sabores típicos de heladería malagueña)
-- ============================================================
INSERT INTO recetas (nombre, descripcion, activo) VALUES
  ('Vainilla de Madagascar',   'Base cremosa con pasta de vainilla Bourbon y yema de huevo', TRUE),           -- 1
  ('Chocolate negro',          'Helado intenso con cacao 22% y cobertura negra al 70%', TRUE),                -- 2
  ('Fresa de temporada',       'Sorbete cremoso de fresa fresca de Huelva con nata', TRUE),                   -- 3
  ('Limón de Málaga',          'Sorbete refrescante con limón natural malagueño', TRUE),                      -- 4
  ('Coco',                     'Cremoso de leche de coco y coco rallado tostado', TRUE),                      -- 5
  ('Pistachio siciliano',      'Helado artesanal con pasta de pistacho 100% sin colorantes', TRUE),           -- 6
  ('Nocciola',                 'Avellana tostada piamontesa con base láctea cremosa', TRUE),                  -- 7
  ('Turrón de Málaga',         'Helado con pasta de turrón artesanal malagueño y almendra', TRUE),            -- 8
  ('Almendrado malagueño',     'Turrón helado con almendra marcona caramelizada', TRUE),                      -- 9
  ('Nata y nuez',              'Helado de nata fresca con nueces en mitades', TRUE),                          -- 10
  ('Café espresso',            'Base de nata con pasta de café y extracto de espresso', TRUE),                -- 11
  ('Stracciatella',            'Helado de nata con virutas de chocolate negro', TRUE),                        -- 12
  ('Mango y maracuyá',         'Sorbete tropical con pulpa de mango y maracuyá', TRUE),                      -- 13
  ('Tiramisú',                 'Helado de mascarpone con café, amaretto y cacao', TRUE),                      -- 14
  ('After Eight',              'Helado de menta piperita con cobertura de chocolate negro', TRUE),            -- 15
  ('Caramelo salado',          'Helado de caramelo con punta de sal marina de Málaga', TRUE),                 -- 16
  ('Yogur de limón',           'Sorbete de yogur natural con limón malagueño', TRUE),                         -- 17
  ('Sandía',                   'Sorbete de sandía fresca de Almería, sin lácteos', TRUE),                     -- 18
  ('Horchata de chufa',        'Cremoso de chufa valenciana extra, receta tradicional', TRUE),                -- 19
  ('Málaga',                   'Clásico malagueño: ron añejo con pasas de moscatel', TRUE),                   -- 20
  ('Moscatel de Málaga',       'Helado con vino dulce D.O. Málaga y uvas pasas', TRUE),                       -- 21
  ('Frambuesa',                'Sorbete de frambuesa con leve toque de limón', TRUE),                         -- 22
  ('Melocotón de Vélez',       'Helado con pulpa de melocotón tardío de Vélez-Málaga', TRUE),                 -- 23
  ('Dulce de leche',           'Cremoso de leche condensada caramelizada al punto', TRUE),                    -- 24
  ('Torrija malagueña',        'Helado inspirado en torrija: canela, vainilla y agua de azahar', TRUE);       -- 25

-- ============================================================
-- INGREDIENTES POR RECETA
-- Cantidades en kg o L por lote de 5L de helado.
-- Ajusta los id_producto según el orden de inserción arriba
-- (los IDs aquí asumen auto_increment desde 1).
-- ============================================================

-- Receta 1 · Vainilla de Madagascar
INSERT INTO ingredientes_receta (id_receta, id_producto, cantidad) VALUES
  (1,  1, 2.80),   -- Leche entera
  (1,  3, 1.20),   -- Nata 35%
  (1, 11, 0.70),   -- Azúcar blanquilla
  (1, 37, 0.06),   -- Pasta de vainilla Bourbon
  (1, 65, 0.15),   -- Yema de huevo pasteurizada
  (1, 19, 0.03);   -- Neutro cremoso

-- Receta 2 · Chocolate negro
INSERT INTO ingredientes_receta (id_receta, id_producto, cantidad) VALUES
  (2,  1, 2.50),   -- Leche entera
  (2,  3, 1.20),   -- Nata 35%
  (2, 11, 0.60),   -- Azúcar
  (2, 51, 0.30),   -- Cacao en polvo
  (2, 52, 0.25),   -- Cobertura chocolate negro
  (2, 19, 0.03);   -- Neutro

-- Receta 3 · Fresa de temporada
INSERT INTO ingredientes_receta (id_receta, id_producto, cantidad) VALUES
  (3,  1, 1.50),   -- Leche entera
  (3,  3, 0.80),   -- Nata 35%
  (3, 11, 0.55),   -- Azúcar
  (3, 28, 0.30),   -- Pasta de fresa
  (3, 59, 1.00),   -- Pulpa de fresa congelada
  (3, 19, 0.03);   -- Neutro

-- Receta 4 · Limón de Málaga
INSERT INTO ingredientes_receta (id_receta, id_producto, cantidad) VALUES
  (4, 11, 0.90),   -- Azúcar
  (4, 12, 0.15),   -- Dextrosa
  (4, 64, 0.50),   -- Limones frescos de Málaga
  (4, 27, 0.20),   -- Pasta de limón
  (4, 20, 0.03);   -- Neutro sorbete

-- Receta 5 · Coco
INSERT INTO ingredientes_receta (id_receta, id_producto, cantidad) VALUES
  (5,  1, 1.80),   -- Leche entera
  (5,  3, 0.80),   -- Nata 35%
  (5, 11, 0.60),   -- Azúcar
  (5, 26, 0.35),   -- Pasta de coco
  (5, 71, 0.30),   -- Coco rallado fino
  (5, 19, 0.03);   -- Neutro

-- Receta 6 · Pistachio siciliano
INSERT INTO ingredientes_receta (id_receta, id_producto, cantidad) VALUES
  (6,  1, 2.60),   -- Leche entera
  (6,  3, 1.00),   -- Nata 35%
  (6, 11, 0.65),   -- Azúcar
  (6, 25, 0.40),   -- Pasta de pistacho siciliano
  (6, 61, 0.15),   -- Pistacho pelado (trozos)
  (6, 19, 0.03);   -- Neutro

-- Receta 7 · Nocciola
INSERT INTO ingredientes_receta (id_receta, id_producto, cantidad) VALUES
  (7,  1, 2.60),   -- Leche entera
  (7,  3, 1.00),   -- Nata 35%
  (7, 11, 0.65),   -- Azúcar
  (7, 26, 0.40),   -- Pasta de avellana (nota: índice real = pasta avellana = id 26)
  (7, 75, 0.25),   -- Praliné de avellana
  (7, 19, 0.03);   -- Neutro

-- Receta 8 · Turrón de Málaga
INSERT INTO ingredientes_receta (id_receta, id_producto, cantidad) VALUES
  (8,  1, 2.40),   -- Leche entera
  (8,  3, 1.00),   -- Nata 35%
  (8, 11, 0.50),   -- Azúcar
  (8, 32, 0.45),   -- Pasta de turrón Málaga
  (8, 58, 0.20),   -- Almendra marcona tostada
  (8, 19, 0.03);   -- Neutro

-- Receta 9 · Almendrado malagueño
INSERT INTO ingredientes_receta (id_receta, id_producto, cantidad) VALUES
  (9,  1, 2.50),   -- Leche entera
  (9,  3, 1.00),   -- Nata 35%
  (9, 11, 0.55),   -- Azúcar
  (9, 27, 0.40),   -- Pasta de almendra marcona
  (9, 57, 0.30),   -- Almendra marcona cruda
  (9, 16, 0.10),   -- Miel de azahar malagueña
  (9, 19, 0.03);   -- Neutro

-- Receta 10 · Nata y nuez
INSERT INTO ingredientes_receta (id_receta, id_producto, cantidad) VALUES
  (10,  1, 2.30),  -- Leche entera
  (10,  3, 1.50),  -- Nata 35%
  (10, 11, 0.60),  -- Azúcar
  (10, 63, 0.40),  -- Nuez pelada
  (10, 19, 0.03);  -- Neutro

-- Receta 11 · Café espresso
INSERT INTO ingredientes_receta (id_receta, id_producto, cantidad) VALUES
  (11,  1, 2.40),  -- Leche entera
  (11,  3, 1.20),  -- Nata 35%
  (11, 11, 0.65),  -- Azúcar
  (11, 31, 0.35),  -- Pasta de café espresso
  (11, 79, 0.08),  -- Extracto café concentrado
  (11, 19, 0.03);  -- Neutro

-- Receta 12 · Stracciatella
INSERT INTO ingredientes_receta (id_receta, id_producto, cantidad) VALUES
  (12,  1, 2.60),  -- Leche entera
  (12,  3, 1.40),  -- Nata 35%
  (12, 11, 0.65),  -- Azúcar
  (12, 37, 0.05),  -- Pasta de vainilla
  (12, 56, 0.20),  -- Virutas de chocolate negro
  (12, 19, 0.03);  -- Neutro

-- Receta 13 · Mango y maracuyá
INSERT INTO ingredientes_receta (id_receta, id_producto, cantidad) VALUES
  (13, 11, 0.70),  -- Azúcar
  (13, 12, 0.15),  -- Dextrosa
  (13, 60, 0.80),  -- Pulpa de mango
  (13, 61, 0.50),  -- Pulpa de maracuyá
  (13, 29, 0.20),  -- Pasta de mango
  (13, 20, 0.04);  -- Neutro sorbete

-- Receta 14 · Tiramisú
INSERT INTO ingredientes_receta (id_receta, id_producto, cantidad) VALUES
  (14,  8, 0.50),  -- Queso mascarpone
  (14,  1, 1.50),  -- Leche entera
  (14,  3, 1.00),  -- Nata 35%
  (14, 11, 0.60),  -- Azúcar
  (14, 33, 0.35),  -- Pasta de tiramisú
  (14, 76, 0.05),  -- Amaretto
  (14, 51, 0.10),  -- Cacao en polvo (decoración)
  (14, 19, 0.03);  -- Neutro

-- Receta 15 · After Eight
INSERT INTO ingredientes_receta (id_receta, id_producto, cantidad) VALUES
  (15,  1, 2.40),  -- Leche entera
  (15,  3, 1.20),  -- Nata 35%
  (15, 11, 0.65),  -- Azúcar
  (15, 35, 0.30),  -- Pasta de menta piperita
  (15, 52, 0.30),  -- Cobertura chocolate negro (trocitos)
  (15, 19, 0.03);  -- Neutro

-- Receta 16 · Caramelo salado
INSERT INTO ingredientes_receta (id_receta, id_producto, cantidad) VALUES
  (16,  1, 2.20),  -- Leche entera
  (16,  3, 1.30),  -- Nata 35%
  (16, 11, 0.50),  -- Azúcar
  (16, 34, 0.40),  -- Pasta de caramelo
  (16, 69, 0.08),  -- Sal marina fina de Málaga
  (16, 19, 0.03);  -- Neutro

-- Receta 17 · Yogur de limón
INSERT INTO ingredientes_receta (id_receta, id_producto, cantidad) VALUES
  (17,  7, 1.50),  -- Yogur natural entero
  (17,  1, 1.00),  -- Leche entera
  (17, 11, 0.55),  -- Azúcar
  (17, 64, 0.30),  -- Limones de Málaga
  (17, 27, 0.15),  -- Pasta de limón
  (17, 20, 0.03);  -- Neutro sorbete

-- Receta 18 · Sandía
INSERT INTO ingredientes_receta (id_receta, id_producto, cantidad) VALUES
  (18, 67, 2.50),  -- Sandía de Almería
  (18, 11, 0.55),  -- Azúcar
  (18, 12, 0.20),  -- Dextrosa
  (18, 64, 0.05),  -- Limón (toque)
  (18, 20, 0.04);  -- Neutro sorbete

-- Receta 19 · Horchata de chufa
INSERT INTO ingredientes_receta (id_receta, id_producto, cantidad) VALUES
  (19, 64, 0.80),  -- Chufa valenciana
  (19,  1, 1.50),  -- Leche entera
  (19, 11, 0.65),  -- Azúcar
  (19, 78, 0.03),  -- Esencia de vainilla natural
  (19, 19, 0.03);  -- Neutro

-- Receta 20 · Málaga (ron y pasas)
INSERT INTO ingredientes_receta (id_receta, id_producto, cantidad) VALUES
  (20,  1, 2.20),  -- Leche entera
  (20,  3, 1.20),  -- Nata 35%
  (20,  8, 0.20),  -- Leche condensada
  (20, 11, 0.40),  -- Azúcar
  (20, 63, 0.80),  -- Pasas de Málaga moscatel
  (20, 72, 0.10),  -- Ron añejo
  (20, 19, 0.03);  -- Neutro

-- Receta 21 · Moscatel de Málaga
INSERT INTO ingredientes_receta (id_receta, id_producto, cantidad) VALUES
  (21,  1, 2.00),  -- Leche entera
  (21,  3, 1.00),  -- Nata 35%
  (21, 11, 0.45),  -- Azúcar
  (21, 42, 0.35),  -- Pasta de moscatel
  (21, 73, 0.15),  -- Vino dulce Málaga D.O.
  (21, 63, 0.30),  -- Pasas moscatel
  (21, 19, 0.03);  -- Neutro

-- Receta 22 · Frambuesa
INSERT INTO ingredientes_receta (id_receta, id_producto, cantidad) VALUES
  (22, 11, 0.75),  -- Azúcar
  (22, 12, 0.15),  -- Dextrosa
  (22, 62, 1.20),  -- Pulpa de frambuesa
  (22, 41, 0.20),  -- Pasta de frambuesa
  (22, 64, 0.05),  -- Limón (toque)
  (22, 20, 0.04);  -- Neutro sorbete

-- Receta 23 · Melocotón de Vélez
INSERT INTO ingredientes_receta (id_receta, id_producto, cantidad) VALUES
  (23,  1, 1.50),  -- Leche entera
  (23,  3, 0.80),  -- Nata 35%
  (23, 11, 0.55),  -- Azúcar
  (23, 39, 0.25),  -- Pasta de melocotón
  (23, 63, 0.90),  -- Pulpa de melocotón congelada
  (23, 19, 0.03);  -- Neutro

-- Receta 24 · Dulce de leche
INSERT INTO ingredientes_receta (id_receta, id_producto, cantidad) VALUES
  (24,  1, 1.80),  -- Leche entera
  (24,  3, 1.00),  -- Nata 35%
  (24,  8, 0.80),  -- Leche condensada caramelizada
  (24, 11, 0.30),  -- Azúcar
  (24, 36, 0.35),  -- Pasta de dulce de leche
  (24, 19, 0.03);  -- Neutro

-- Receta 25 · Torrija malagueña
INSERT INTO ingredientes_receta (id_receta, id_producto, cantidad) VALUES
  (25,  1, 2.20),  -- Leche entera
  (25,  3, 1.10),  -- Nata 35%
  (25,  8, 0.30),  -- Leche condensada
  (25, 11, 0.45),  -- Azúcar
  (25, 37, 0.04),  -- Pasta de vainilla
  (25, 80, 0.05),  -- Agua de azahar malagueña
  (25, 19, 0.03);  -- Neutro

-- ============================================================
-- HELADOS (25 sabores — BARQUETA o PALETA)
-- ============================================================
INSERT INTO helados (nombre, tipo, id_receta, stock_actual, stock_minimo, coste_producion, activo) VALUES
  ('Vainilla de Madagascar',  'BARQUETA',  1,  18,  8, 3.40, TRUE),
  ('Chocolate negro',         'BARQUETA',  2,  15,  6, 3.80, TRUE),
  ('Fresa de temporada',      'BARQUETA',  3,  12,  5, 3.20, TRUE),
  ('Limón de Málaga',         'BARQUETA',  4,  20,  8, 2.60, TRUE),
  ('Coco',                    'BARQUETA',  5,  10,  4, 3.50, TRUE),
  ('Pistachio siciliano',     'BARQUETA',  6,   8,  3, 5.80, TRUE),
  ('Nocciola',                'BARQUETA',  7,  10,  4, 4.60, TRUE),
  ('Turrón de Málaga',        'BARQUETA',  8,  10,  4, 5.20, TRUE),
  ('Almendrado malagueño',    'BARQUETA',  9,   8,  3, 4.80, TRUE),
  ('Nata y nuez',             'BARQUETA', 10,  12,  5, 3.60, TRUE),
  ('Café espresso',           'BARQUETA', 11,  10,  4, 3.70, TRUE),
  ('Stracciatella',           'BARQUETA', 12,  14,  5, 3.30, TRUE),
  ('Mango y maracuyá',        'BARQUETA', 13,  10,  4, 3.00, TRUE),
  ('Tiramisú',                'BARQUETA', 14,   8,  3, 5.40, TRUE),
  ('After Eight',             'BARQUETA', 15,   8,  3, 4.10, TRUE),
  ('Caramelo salado',         'BARQUETA', 16,  10,  4, 3.80, TRUE),
  ('Yogur de limón',          'BARQUETA', 17,  12,  5, 2.80, TRUE),
  ('Sandía',                  'BARQUETA', 18,  16,  6, 2.40, TRUE),
  ('Horchata de chufa',       'BARQUETA', 19,  10,  4, 3.20, TRUE),
  ('Málaga',                  'BARQUETA', 20,  14,  5, 4.20, TRUE),
  ('Moscatel de Málaga',      'BARQUETA', 21,   8,  3, 4.50, TRUE),
  ('Frambuesa',               'BARQUETA', 22,  10,  4, 2.90, TRUE),
  ('Melocotón de Vélez',      'BARQUETA', 23,  10,  4, 3.10, TRUE),
  ('Dulce de leche',          'BARQUETA', 24,  12,  5, 3.60, TRUE),
  ('Torrija malagueña',       'BARQUETA', 25,   8,  3, 4.00, TRUE);
