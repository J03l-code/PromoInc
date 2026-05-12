<?php
require_once 'config.php';

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $stmt = $pdo->query("SELECT * FROM brand_logos WHERE active = 1 ORDER BY sort_order ASC, id DESC");
    $items = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "data" => $items
    ]);

} catch (PDOException $e) {
    if (strpos($e->getMessage(), "doesn't exist") !== false || strpos($e->getMessage(), "no such table") !== false) {
        echo json_encode(["success" => true, "data" => []]);
        exit;
    }
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
