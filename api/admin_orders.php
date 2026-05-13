<?php
/**
 * PromoInc — API Admin: Gestión de Pedidos (protegida)
 * GET    → Lista paginada con filtros
 * GET ?id=X → Detalle de pedido
 * PUT    → Actualizar status + nota
 */
require_once __DIR__ . '/middleware.php';
requireAdmin();

$db     = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $id     = $_GET['id'] ?? null;
    $status = $_GET['status'] ?? '';
    $search = $_GET['search'] ?? '';
    $page   = max(1, (int)($_GET['page'] ?? 1));
    $limit  = 50;
    $offset = ($page - 1) * $limit;

    // Detalle de un pedido
    if ($id) {
        $stmt = $db->prepare("
            SELECT o.*, u.email AS user_email
            FROM orders o
            LEFT JOIN users u ON u.id = o.user_id
            WHERE o.id = ?
        ");
        $stmt->execute([$id]);
        $order = $stmt->fetch();
        if (!$order) jsonError(404, 'Pedido no encontrado');
        $order['items'] = json_decode($order['items'], true);
        jsonSuccess(['order' => $order]);
    }

    // Lista con filtros
    $where  = ['1=1'];
    $params = [];
    if ($status) { $where[] = 'o.status = ?'; $params[] = $status; }
    if ($search) {
        $where[] = '(o.order_number LIKE ? OR o.customer_name LIKE ? OR o.customer_phone LIKE ?)';
        $like = "%$search%";
        array_push($params, $like, $like, $like);
    }
    $sql = "SELECT o.id, o.order_number, o.customer_name, o.customer_phone,
                   o.customer_email, o.delivery_city, o.total, o.status, o.created_at, o.updated_at
            FROM orders o
            WHERE " . implode(' AND ', $where) . "
            ORDER BY o.created_at DESC LIMIT $limit OFFSET $offset";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $orders = $stmt->fetchAll();

    // Total count
    $countSql = "SELECT COUNT(*) FROM orders o WHERE " . implode(' AND ', $where);
    $cStmt = $db->prepare($countSql);
    $cStmt->execute($params);
    $total = (int)$cStmt->fetchColumn();

    jsonSuccess(['orders' => $orders, 'total' => $total, 'page' => $page]);
}

if ($method === 'PUT') {
    $data = $GLOBALS['_POST_JSON'] ?? json_decode(file_get_contents('php://input'), true) ?? [];
    unset($data['_method']);

    if (empty($data['id'])) jsonError(400, 'ID de pedido requerido');

    $validStatuses = ['pending','confirmed','processing','shipped','delivered','cancelled'];
    if (!empty($data['status']) && !in_array($data['status'], $validStatuses)) {
        jsonError(400, 'Estado inválido');
    }

    $fields = [];
    $params = [];
    if (!empty($data['status']))      { $fields[] = 'status = ?';      $params[] = $data['status']; }
    if (isset($data['status_note']))  { $fields[] = 'status_note = ?'; $params[] = sanitize($data['status_note']); }

    if (empty($fields)) jsonError(400, 'Nada que actualizar');

    $params[] = (int)$data['id'];
    $db->prepare("UPDATE orders SET " . implode(', ', $fields) . " WHERE id = ?")->execute($params);

    jsonSuccess(['updated' => true]);
}

if ($method === 'DELETE') {
    $data = $GLOBALS['_POST_JSON'] ?? json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($data['id'])) jsonError(400, 'ID de pedido requerido');

    $db->prepare("DELETE FROM orders WHERE id = ?")->execute([(int)$data['id']]);
    jsonSuccess(['deleted' => true]);
}

jsonError(405, 'Método no permitido');
