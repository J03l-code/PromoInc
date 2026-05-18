<?php
require_once 'api/config.php';
$db = getDB();

try {
    $db->exec("CREATE TABLE IF NOT EXISTS product_categories (
        product_id INT UNSIGNED NOT NULL,
        category_id INT UNSIGNED NOT NULL,
        PRIMARY KEY (product_id, category_id),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    
    $db->exec("INSERT IGNORE INTO product_categories (product_id, category_id) SELECT id, category_id FROM products WHERE category_id IS NOT NULL;");
    
    echo "Tabla product_categories creada y datos migrados exitosamente.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
