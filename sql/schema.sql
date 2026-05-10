-- ============================================================
--  PromoInc — Esquema completo de base de datos
--  Motor: MySQL 8.0+ / MariaDB 10.5+
--  Ejecutar: mysql -u root -p < sql/schema.sql
-- ============================================================

-- NOTA: Importa este archivo en una base de datos ya creada.

-- ── USUARIOS ADMIN ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  name          VARCHAR(120)     NOT NULL,
  email         VARCHAR(180)     NOT NULL UNIQUE,
  password_hash VARCHAR(255)     NOT NULL,
  role          ENUM('superadmin','admin','editor') NOT NULL DEFAULT 'editor',
  active        TINYINT(1)       NOT NULL DEFAULT 1,
  last_login    DATETIME         NULL,
  created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Usuario por defecto: admin@promoinc.com / Admin2024!
-- El hash se debe regenerar con: password_hash('Admin2024!', PASSWORD_BCRYPT)
INSERT IGNORE INTO users (name, email, password_hash, role) VALUES
  ('Administrador', 'admin@promoinc.com',
   '$2y$12$uB6TqJGFkdlHy3sG5tJxouLSRaQOy/fSDjFijNwWZtRjvRYmhJNHm',
   'superadmin');

-- ── CATEGORÍAS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  parent_id   INT UNSIGNED NOT NULL DEFAULT 0,
  name        VARCHAR(120) NOT NULL,
  slug        VARCHAR(120) NOT NULL UNIQUE,
  icon        VARCHAR(80)  NULL,
  sort_order  INT          NOT NULL DEFAULT 0,
  active      TINYINT(1)  NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY idx_parent (parent_id),
  KEY idx_slug   (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO categories (name, slug, icon, sort_order) VALUES
  ('Tecnología y USB',        'tecnologia',    'cpu',         1),
  ('Bolígrafos y Escritura',  'escritura',     'pen-tool',    2),
  ('Tomatodos y Termos',      'tomatodos',     'coffee',      3),
  ('Confecciones y Gorras',   'confecciones',  'scissors',    4),
  ('Línea Ecológica',         'ecologico',     'leaf',        5),
  ('Bolsos y Maletines',      'bolsos',        'briefcase',   6),
  ('Hogar y Cocina',          'hogar',         'home',        7),
  ('Llaveros',                'llaveros',      'key',         8),
  ('Oficina y Escritorio',    'oficina',       'monitor',     9),
  ('Textil y Ropa',           'textil',        'layers',     10);

-- ── PRODUCTOS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id           INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  category_id  INT UNSIGNED   NOT NULL,
  sku          VARCHAR(60)    NOT NULL UNIQUE,
  name         VARCHAR(220)   NOT NULL,
  slug         VARCHAR(220)   NOT NULL UNIQUE,
  description  TEXT           NULL,
  price_from   DECIMAL(10,2)  NULL,
  image_webp   VARCHAR(255)   NULL,
  min_quantity INT UNSIGNED   NOT NULL DEFAULT 10,
  customizable TINYINT(1)     NOT NULL DEFAULT 1,
  featured     TINYINT(1)     NOT NULL DEFAULT 0,
  active       TINYINT(1)     NOT NULL DEFAULT 1,
  created_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_category (category_id),
  KEY idx_slug     (slug),
  KEY idx_active   (active),
  FULLTEXT KEY ft_search (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── STOCK ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id  INT UNSIGNED NOT NULL,
  variant     VARCHAR(80)  NOT NULL DEFAULT 'Única',
  quantity    INT          NOT NULL DEFAULT 0,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_product_variant (product_id, variant),
  KEY idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── COTIZACIONES / LEADS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS quotes (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  company     VARCHAR(180) NOT NULL,
  contact     VARCHAR(120) NOT NULL,
  email       VARCHAR(180) NOT NULL,
  phone       VARCHAR(40)  NULL,
  message     TEXT         NOT NULL,
  product_ref VARCHAR(220) NULL,
  status      ENUM('new','read','responded','closed') NOT NULL DEFAULT 'new',
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── SETTINGS (configuración del sitio) ─────────────────────
CREATE TABLE IF NOT EXISTS settings (
  `key`    VARCHAR(80) NOT NULL,
  `value`  TEXT        NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO settings (`key`, `value`) VALUES
  ('site_name',      'PromoInc'),
  ('site_email',     'info@promoinc.com'),
  ('site_phone',     '+57 300 000 0000'),
  ('site_address',   'Colombia'),
  ('whatsapp',       '573000000000'),
  ('instagram',      'promoinc'),
  ('facebook',       'promoinc'),
  ('hero_title',     'Así se compra merchandising'),
  ('hero_subtitle',  'Explora productos, revisa precios, compra en minutos.');
