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

    echo "<h2 style='color:green'>Migración completada exitosamente!</h2>";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
