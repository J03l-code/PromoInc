<?php
require_once __DIR__ . '/config.php';

$db = getDB();

try {
    $db->exec("ALTER TABLE products ADD COLUMN on_sale TINYINT(1) DEFAULT 0 AFTER featured");
    $db->exec("ALTER TABLE products ADD COLUMN sale_price DECIMAL(10,2) DEFAULT NULL AFTER on_sale");
    $db->exec("ALTER TABLE products ADD COLUMN sale_discount INT DEFAULT 0 AFTER sale_price");
    echo "Migration successful: on_sale, sale_price, sale_discount columns added to products table.";
} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage();
}
