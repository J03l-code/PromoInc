<?php
/**
 * PromoInc — API Settings Pública
 */
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError(405, 'Método no permitido');
}

$db = getDB();
$stmt = $db->query("SELECT `key`, `value` FROM settings");
$settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

jsonSuccess($settings);
