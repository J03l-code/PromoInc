<?php
require_once 'api/config.php';
$db = getDB();

try {
    // Agregar columna 'phone' a users si no existe
    try {
        $db->exec("ALTER TABLE users ADD COLUMN phone VARCHAR(50) DEFAULT NULL AFTER email");
        echo "Columna 'phone' añadida a users.<br>";
    } catch (PDOException $e) {
        // Ignorar si ya existe
        if ($e->getCode() == '42S21') {
            echo "Columna 'phone' ya existe.<br>";
        } else {
            throw $e;
        }
    }

    // Agregar columna 'show_min_quantity' a products si no existe
    try {
        $db->exec("ALTER TABLE products ADD COLUMN show_min_quantity BOOLEAN NOT NULL DEFAULT 0 AFTER min_quantity");
        echo "Columna 'show_min_quantity' añadida a products.<br>";
    } catch (PDOException $e) {
        // Ignorar si ya existe
        if ($e->getCode() == '42S21') {
            echo "Columna 'show_min_quantity' ya existe.<br>";
        } else {
            throw $e;
        }
    }

    // Agregar columna 'customization_type' a products si no existe
    try {
        $db->exec("ALTER TABLE products ADD COLUMN customization_type VARCHAR(255) NULL AFTER customizable");
        echo "Columna 'customization_type' añadida a products.<br>";
    } catch (PDOException $e) {
        // Ignorar si ya existe
        if ($e->getCode() == '42S21') {
            echo "Columna 'customization_type' ya existe.<br>";
        } else {
            throw $e;
        }
    }

    // Agregar columna 'shipping_cost' a products si no existe
    try {
        $db->exec("ALTER TABLE products ADD COLUMN shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER price_from");
        echo "Columna 'shipping_cost' añadida a products.<br>";
    } catch (PDOException $e) {
        // Ignorar si ya existe
        if ($e->getCode() == '42S21') {
            echo "Columna 'shipping_cost' ya existe.<br>";
        } else {
            throw $e;
        }
    }

    // Agregar columna 'images_gallery' a products si no existe
    try {
        $db->exec("ALTER TABLE products ADD COLUMN images_gallery TEXT NULL DEFAULT NULL AFTER image_webp");
        echo "Columna 'images_gallery' añadida a products.<br>";
    } catch (PDOException $e) {
        // Ignorar si ya existe
        if ($e->getCode() == '42S21') {
            echo "Columna 'images_gallery' ya existe.<br>";
        } else {
            throw $e;
        }
    }

    // Crear tabla orders
    $db->exec("CREATE TABLE IF NOT EXISTS orders (
        id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(20) UNIQUE NOT NULL,
        user_id     INT UNSIGNED NULL,
        customer_name    VARCHAR(255) NOT NULL,
        customer_phone   VARCHAR(50)  NOT NULL,
        customer_email   VARCHAR(255),
        customer_company VARCHAR(255),
        delivery_address TEXT NOT NULL,
        delivery_city    VARCHAR(100) NOT NULL,
        delivery_notes   TEXT,
        items       JSON NOT NULL,
        total       DECIMAL(10,2) NOT NULL,
        status      ENUM('pending','confirmed','processing','shipped','delivered','cancelled') DEFAULT 'pending',
        status_note TEXT,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "Tabla 'orders' creada o verificada.<br>";
    
    // Crear tabla quotes
    $db->exec("CREATE TABLE IF NOT EXISTS quotes (
        id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        company      VARCHAR(255) NOT NULL,
        contact_name VARCHAR(255) NOT NULL,
        email        VARCHAR(255) NOT NULL,
        phone        VARCHAR(50),
        message      TEXT,
        products_json JSON,
        status       ENUM('new','read','responded','closed') DEFAULT 'new',
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "Tabla 'quotes' creada o verificada.<br>";

    // Crear tabla portfolio
    $db->exec("CREATE TABLE IF NOT EXISTS portfolio (
        id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        title       VARCHAR(255) NOT NULL,
        description TEXT,
        filename    VARCHAR(255) NOT NULL,
        sort_order  INT DEFAULT 0,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "Tabla 'portfolio' creada o verificada.<br>";

    // Crear tabla product_categories
    $db->exec("CREATE TABLE IF NOT EXISTS product_categories (
        product_id INT UNSIGNED NOT NULL,
        category_id INT UNSIGNED NOT NULL,
        PRIMARY KEY (product_id, category_id),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    
    // Migrar datos existentes
    $db->exec("INSERT IGNORE INTO product_categories (product_id, category_id) SELECT id, category_id FROM products WHERE category_id IS NOT NULL;");
    echo "Tabla 'product_categories' creada e indexada con las categorías existentes.<br>";

    // Agregar columna 'parent_id' a categories si no existe
    try {
        $db->exec("ALTER TABLE categories ADD COLUMN parent_id INT UNSIGNED NOT NULL DEFAULT 0 AFTER id");
        echo "Columna 'parent_id' añadida a categories.<br>";
    } catch (PDOException $e) {
        if ($e->getCode() == '42S21') {
            echo "Columna 'parent_id' ya existe en categories.<br>";
        } else {
            throw $e;
        }
    }

    // Agregar columna 'show_in_sidebar' a categories si no existe
    try {
        $db->exec("ALTER TABLE categories ADD COLUMN show_in_sidebar TINYINT(1) NOT NULL DEFAULT 1 AFTER active");
        echo "Columna 'show_in_sidebar' añadida a categories.<br>";
    } catch (PDOException $e) {
        if ($e->getCode() == '42S21') {
            echo "Columna 'show_in_sidebar' ya existe en categories.<br>";
        } else {
            throw $e;
        }
    }

    // Agregar columna 'show_in_menu' a categories si no existe
    try {
        $db->exec("ALTER TABLE categories ADD COLUMN show_in_menu TINYINT(1) NOT NULL DEFAULT 1 AFTER show_in_sidebar");
        echo "Columna 'show_in_menu' añadida a categories.<br>";
    } catch (PDOException $e) {
        if ($e->getCode() == '42S21') {
            echo "Columna 'show_in_menu' ya existe en categories.<br>";
        } else {
            throw $e;
        }
    }

    // Agregar columna 'dimensions' a products si no existe
    try {
        $db->exec("ALTER TABLE products ADD COLUMN dimensions VARCHAR(100) NULL DEFAULT NULL AFTER description");
        echo "Columna 'dimensions' añadida a products.<br>";
    } catch (PDOException $e) {
        if ($e->getCode() == '42S21') { echo "Columna 'dimensions' ya existe.<br>"; } else { throw $e; }
    }

    // Agregar columna 'weight' a products si no existe
    try {
        $db->exec("ALTER TABLE products ADD COLUMN weight VARCHAR(50) NULL DEFAULT NULL AFTER dimensions");
        echo "Columna 'weight' añadida a products.<br>";
    } catch (PDOException $e) {
        if ($e->getCode() == '42S21') { echo "Columna 'weight' ya existe.<br>"; } else { throw $e; }
    }

    // Agregar columna 'capacity' a products si no existe
    try {
        $db->exec("ALTER TABLE products ADD COLUMN capacity VARCHAR(50) NULL DEFAULT NULL AFTER weight");
        echo "Columna 'capacity' añadida a products.<br>";
    } catch (PDOException $e) {
        if ($e->getCode() == '42S21') { echo "Columna 'capacity' ya existe.<br>"; } else { throw $e; }
    }

    // Agregar columna 'customization_area' a products si no existe
    try {
        $db->exec("ALTER TABLE products ADD COLUMN customization_area VARCHAR(100) NULL DEFAULT NULL AFTER capacity");
        echo "Columna 'customization_area' añadida a products.<br>";
    } catch (PDOException $e) {
        if ($e->getCode() == '42S21') { echo "Columna 'customization_area' ya existe.<br>"; } else { throw $e; }
    }

    // Agregar columna 'specifications' a products si no existe
    try {
        $db->exec("ALTER TABLE products ADD COLUMN specifications TEXT NULL DEFAULT NULL AFTER customization_area");
        echo "Columna 'specifications' añadida a products.<br>";
    } catch (PDOException $e) {
        if ($e->getCode() == '42S21') { echo "Columna 'specifications' ya existe.<br>"; } else { throw $e; }
    }

    echo "<h2 style='color:green'>Migración completada exitosamente!</h2>";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
