<?php
require_once 'config.php';
$db = getDB();
$stmt = $db->query("SELECT `key`, `value` FROM settings");
$rows = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
echo json_encode($rows, JSON_PRETTY_PRINT);
