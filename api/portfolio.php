<?php
/**
 * PromoInc — API Pública: Portafolio de trabajos realizados
 * GET /api/portfolio.php
 */

require_once 'config.php';

try {
    $db = getDB();
    $stmt = $db->query("SELECT * FROM portfolio ORDER BY sort_order ASC, id DESC");
    $items = $stmt->fetchAll();

    jsonSuccess($items);
} catch (PDOException $e) {
    jsonError(500, 'Error al obtener portafolio: ' . $e->getMessage());
}
