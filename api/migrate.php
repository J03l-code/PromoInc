<?php
require_once __DIR__ . '/config.php';

try {
    $db = getDB();
    
    // Update users table enum
    $db->exec("ALTER TABLE users MODIFY COLUMN role ENUM('superadmin','admin','editor','client') NOT NULL DEFAULT 'client'");
    
    // Create user_logos table
    $db->exec("CREATE TABLE IF NOT EXISTS user_logos (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id INT UNSIGNED NOT NULL,
        filename VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_user (user_id),
        CONSTRAINT fk_user_logos FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    echo "Migration completed successfully!";
} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage();
}
