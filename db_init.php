<?php
require_once 'api/config.php';
$db = getDB();

try {
    $sql = "CREATE TABLE IF NOT EXISTS product_prices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        min_qty INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    
    $db->exec($sql);
    echo "Tabla product_prices creada o ya existente.\n";
    
    // Verificar si existe la columna slug en products (por si acaso)
    $db->exec("ALTER TABLE products ADD COLUMN IF NOT EXISTS slug VARCHAR(255) AFTER name;");
    echo "Columna slug verificada.\n";
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
unlink(__FILE__); // Autodestrucción
?>
