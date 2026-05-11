<?php
/**
 * PromoInc — API Pública: Obtener configuración específica
 * GET /api/public_settings.php?key=whatsapp_number
 */

require_once 'config.php';

$key = $_GET['key'] ?? '';
if (!$key) {
    jsonError(400, 'Parámetro key requerido');
}

$db = getDB();
$stmt = $db->prepare("SELECT `value` FROM settings WHERE `key` = ?");
$stmt->execute([$key]);
$row = $stmt->fetch();

if ($row) {
    jsonSuccess(['key' => $key, 'value' => $row['value']]);
} else {
    jsonError(404, 'Configuración no encontrada');
}
