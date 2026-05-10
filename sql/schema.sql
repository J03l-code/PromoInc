-- ============================================================
-- PromoInc — Esquema de Base de Datos v1.0
-- Motor: MySQL 8.0+
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS promoinc_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE promoinc_db;

-- ------------------------------------------------------------
-- 1. CATEGORÍAS (árbol con soporte multinivel)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  parent_id  INT UNSIGNED DEFAULT NULL,
  name       VARCHAR(120) NOT NULL,
  slug       VARCHAR(140) NOT NULL UNIQUE,
  icon       VARCHAR(80)  DEFAULT NULL COMMENT 'Nombre del SVG icon',
  sort_order TINYINT UNSIGNED DEFAULT 0,
  active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cat_parent FOREIGN KEY (parent_id)
    REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_cat_parent  ON categories(parent_id);
CREATE INDEX idx_cat_active  ON categories(active, sort_order);

-- ------------------------------------------------------------
-- 2. PRODUCTOS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id   INT UNSIGNED NOT NULL,
  sku           VARCHAR(40)  NOT NULL UNIQUE,
  name          VARCHAR(220) NOT NULL,
  slug          VARCHAR(260) NOT NULL UNIQUE,
  description   TEXT,
  price_from    DECIMAL(10,2) DEFAULT NULL COMMENT 'Precio mínimo referencial',
  image_webp    VARCHAR(300) DEFAULT NULL COMMENT 'Ruta relativa a /assets/images/',
  gallery_json  JSON         DEFAULT NULL COMMENT 'Array de rutas adicionales',
  min_quantity  SMALLINT UNSIGNED DEFAULT 10,
  customizable  TINYINT(1) NOT NULL DEFAULT 1,
  featured      TINYINT(1) NOT NULL DEFAULT 0,
  active        TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_prod_cat FOREIGN KEY (category_id)
    REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_prod_cat      ON products(category_id);
CREATE INDEX idx_prod_featured ON products(featured, active);
CREATE INDEX idx_prod_slug     ON products(slug);
CREATE FULLTEXT INDEX ft_prod_name ON products(name, description);

-- ------------------------------------------------------------
-- 3. STOCK (por variante: color / talla / presentación)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id  INT UNSIGNED NOT NULL,
  variant     VARCHAR(80)  DEFAULT 'Estándar' COMMENT 'Color, talla, presentación',
  quantity    INT NOT NULL DEFAULT 0,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_stock_prod FOREIGN KEY (product_id)
    REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uq_stock_variant (product_id, variant)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_stock_prod ON stock(product_id);

-- ------------------------------------------------------------
-- 4. CLIENTES CORPORATIVOS (Social Proof)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  logo_file  VARCHAR(300) DEFAULT NULL COMMENT 'Logo en /assets/images/clients/',
  industry   VARCHAR(80)  DEFAULT NULL,
  sort_order TINYINT UNSIGNED DEFAULT 0,
  active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 5. COTIZACIONES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quotes (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company       VARCHAR(180) NOT NULL,
  contact_name  VARCHAR(120) NOT NULL,
  email         VARCHAR(180) NOT NULL,
  phone         VARCHAR(30)  DEFAULT NULL,
  products_json JSON         DEFAULT NULL COMMENT 'Array {product_id, qty, notes}',
  message       TEXT,
  status        ENUM('pending','in_review','sent','closed') DEFAULT 'pending',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_quote_status ON quotes(status, created_at);

-- ------------------------------------------------------------
-- 6. DATOS DE DEMOSTRACIÓN
-- ------------------------------------------------------------
INSERT INTO categories (id, parent_id, name, slug, icon, sort_order) VALUES
  (1,  NULL, 'Tecnología',          'tecnologia',       'cpu',         1),
  (2,  NULL, 'Escritura',           'escritura',        'pen',         2),
  (3,  NULL, 'Confecciones',        'confecciones',     'shirt',       3),
  (4,  NULL, 'Oficina',             'oficina',          'briefcase',   4),
  (5,  NULL, 'Tomatodos & Termos',  'tomatodos-termos', 'droplet',     5),
  (6,  NULL, 'Ecología',            'ecologia',         'leaf',        6),
  (7,  NULL, 'Llaveros',            'llaveros',         'key',         7),
  (8,  NULL, 'Empaques Especiales', 'empaques',         'package',     8),
  (9,  1,    'USB & Memorias',      'usb-memorias',     'usb',         1),
  (10, 1,    'Accesorios Celular',  'accesorios-cel',   'smartphone',  2);

INSERT INTO products (id, category_id, sku, name, slug, description, price_from, image_webp, min_quantity, customizable, featured) VALUES
  (1,  1,  'TE-001', 'USB Metálica Elegance',    'usb-metalica-elegance',   'USB metálica de 16GB con acabado premium anodizado. Personalización láser incluida.',       2.50,  'usb-metalica.webp',    25,  1, 1),
  (2,  2,  'BOL-001','Bolígrafo Executive Pro',  'boligrafo-executive-pro', 'Bolígrafo metálico con mecanismo giratorio y clip dorado. Tinta alemana de larga duración.', 1.20,  'boligrafo-exec.webp',  50,  1, 1),
  (3,  3,  'CAM-001','Camiseta Polo Corporate',  'camiseta-polo-corporate', 'Polo piqué 220gr/m², disponible en 12 colores corporativos. Bordado o serigrafía.',         4.80,  'polo-corporate.webp',  20,  1, 1),
  (4,  5,  'MU-001', 'Termo Acero Inox 500ml',   'termo-acero-inox-500ml',  'Termo de doble pared en acero inoxidable 304. Mantiene temperatura 12 horas.',              6.50,  'termo-inox.webp',      15,  1, 1),
  (5,  4,  'OF-001', 'Set Ejecutivo Premium',    'set-ejecutivo-premium',   'Set: bolígrafo + libreta tapa dura + lapicero. Presentación caja regalo.',                  12.00, 'set-ejecutivo.webp',   10,  1, 1),
  (6,  6,  'EC-001', 'Tote Bag Ecológico',       'tote-bag-ecologico',      'Bolsa tote de algodón canvas 140gr. Impresión serigrafía full-color o bordado.',             1.80,  'tote-bag.webp',        50,  1, 1),
  (7,  7,  'LL-001', 'Llavero Metálico Láser',   'llavero-metalico-laser',  'Llavero de zinc fundido con grabado láser de alta precisión. Acabado mate o brillante.',    0.85,  'llavero-metal.webp',   100, 1, 1),
  (8,  1,  'TE-002', 'Power Bank 10000mAh',      'power-bank-10000',        'Cargador portátil de 10.000mAh con dos puertos USB-A y USB-C. Logo impreso en relieve.',     8.90,  'power-bank.webp',      20,  1, 1);

INSERT INTO stock (product_id, variant, quantity) VALUES
  (1, 'Plateado', 150), (1, 'Negro', 200), (1, 'Dorado', 80),
  (2, 'Negro/Dorado', 500), (2, 'Plata/Negro', 350),
  (3, 'Blanco T-M', 200), (3, 'Blanco T-L', 180), (3, 'Negro T-M', 150),
  (4, 'Negro', 120), (4, 'Plateado', 95), (4, 'Gunmetal', 60),
  (5, 'Estándar', 75),
  (6, 'Natural', 400), (6, 'Negro', 300),
  (7, 'Plateado', 600), (7, 'Negro', 450),
  (8, 'Negro', 90), (8, 'Gris', 70);

INSERT INTO clients (name, logo_file, industry, sort_order) VALUES
  ('Banco del Pacífico',    'cliente-banco-pacifico.webp',  'Banca',           1),
  ('Corporación El Rosado', 'cliente-el-rosado.webp',       'Retail',          2),
  ('Nestlé Ecuador',        'cliente-nestle.webp',           'Alimentación',    3),
  ('Telefónica Movistar',   'cliente-movistar.webp',         'Telecomunicaciones', 4),
  ('ENAP',                  'cliente-enap.webp',             'Energía',         5),
  ('Claro Ecuador',         'cliente-claro.webp',            'Telecomunicaciones', 6);

SET FOREIGN_KEY_CHECKS = 1;
