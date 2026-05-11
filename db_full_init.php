<?php
require_once 'api/config.php';
$db = getDB();

try {
    // 1. Tabla de Usuarios
    $db->exec("CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'client') DEFAULT 'client',
        last_login DATETIME DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "Tabla users verificada.<br>";

    // 2. Tabla de Productos
    $db->exec("CREATE TABLE IF NOT EXISTS products (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        sku VARCHAR(100) UNIQUE,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255),
        description TEXT,
        category VARCHAR(100),
        base_price DECIMAL(10,2) DEFAULT 0.00,
        stock_qty INT DEFAULT 0,
        image_url VARCHAR(255),
        image_webp VARCHAR(255),
        is_featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "Tabla products verificada.<br>";

    // 3. Tabla de Precios por Volumen
    $db->exec("CREATE TABLE IF NOT EXISTS product_prices (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        product_id INT UNSIGNED NOT NULL,
        min_qty INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "Tabla product_prices verificada.<br>";

    // 4. Tabla de Cotizaciones/Favoritos
    $db->exec("CREATE TABLE IF NOT EXISTS cart_items (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        product_id INT UNSIGNED NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(10,2) NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "Tabla cart_items verificada.<br>";

    // 5. Tabla de Logos de Usuario
    $db->exec("CREATE TABLE IF NOT EXISTS user_logos (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "Tabla user_logos verificada.<br>";

    echo "<h3>Base de datos inicializada correctamente.</h3>";

} catch (PDOException $e) {
    echo "Error crítico: " . $e->getMessage();
}
?>
