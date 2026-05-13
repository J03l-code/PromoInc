<?php
/**
 * PromoInc — API Admin: Cotizaciones (protegida)
 * GET  /api/admin_quotes.php           → Listado con filtros
 * PUT  /api/admin_quotes.php           → Actualizar estado
 * DELETE /api/admin_quotes.php         → Eliminar
 */

require_once 'middleware.php';
requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

switch ($method) {
    case 'GET':    getQuotes($db);    break;
    case 'PUT':    updateQuote($db);  break;
    case 'DELETE': deleteQuote($db);  break;
    default:       jsonError(405, 'Método no permitido');
}

function getQuotes(PDO $db): void {
    $status = !empty($_GET['status']) ? $_GET['status'] : null;
    $limit  = min((int)($_GET['limit']  ?? 50), 200);
    $offset = max((int)($_GET['offset'] ?? 0), 0);

    $where  = [];
    $params = [];
    if ($status) { $where[] = 'status = ?'; $params[] = $status; }
    $whereSQL = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    $stmt = $db->prepare("
        SELECT * FROM quotes {$whereSQL}
        ORDER BY created_at DESC
        LIMIT {$limit} OFFSET {$offset}
    ");
    $stmt->execute($params);
    $quotes = $stmt->fetchAll();

    $countStmt = $db->prepare("SELECT COUNT(*) FROM quotes {$whereSQL}");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    // Contadores por estado
    $counters = $db->query("
        SELECT status, COUNT(*) AS total FROM quotes GROUP BY status
    ")->fetchAll(PDO::FETCH_KEY_PAIR);

    jsonSuccess(['items' => $quotes, 'total' => $total, 'counters' => $counters]);
}

function updateQuote(PDO $db): void {
    $data = $GLOBALS['_POST_JSON'] ?? json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($data['id'])) jsonError(400, 'ID requerido');

    $validStatuses = ['new', 'read', 'responded', 'closed'];
    $status = in_array($data['status'] ?? '', $validStatuses) ? $data['status'] : 'read';

    $db->prepare("UPDATE quotes SET status = ? WHERE id = ?")->execute([$status, (int)$data['id']]);
    jsonSuccess(['updated' => true]);
}

function deleteQuote(PDO $db): void {
    $data = $GLOBALS['_POST_JSON'] ?? json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($data['id'])) jsonError(400, 'ID requerido');
    $db->prepare("DELETE FROM quotes WHERE id = ?")->execute([(int)$data['id']]);
    jsonSuccess(['deleted' => true]);
}
