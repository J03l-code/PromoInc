<?php
/**
 * PromoInc — API Admin: Settings del sitio (protegida)
 * GET /api/admin_settings.php     → Obtener todos los settings
 * PUT /api/admin_settings.php     → Guardar/Actualizar settings
 */

require_once 'middleware.php';
requireAdmin();

$db = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $db->query("SELECT `key`, `value` FROM settings ORDER BY `key`");
    $rows  = $stmt->fetchAll();
    $data  = [];
    foreach ($rows as $row) $data[$row['key']] = $row['value'];
    jsonSuccess($data);
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = $GLOBALS['_POST_JSON'] ?? json_decode(file_get_contents('php://input'), true) ?? [];
    if (!$data) jsonError(400, 'Datos inválidos');
    
    // Quitar _method si existe (viene de la emulación de admin.js)
    unset($data['_method']);

    $stmt = $db->prepare("INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)");
    foreach ($data as $key => $value) {
        $stmt->execute([sanitize($key), sanitize((string)$value)]);
    }
    jsonSuccess(['saved' => true]);
}

jsonError(405, 'Método no permitido');
