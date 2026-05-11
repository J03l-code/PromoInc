<?php
/**
 * PromoInc — API de Pedidos
 * POST   → Crear nuevo pedido (público, desde checkout)
 * GET ?user=me → Pedidos del usuario logueado
 * GET ?number=PI-XXX → Detalle por número
 */
require_once __DIR__ . '/config.php';

$db     = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// ── POST: Crear pedido ────────────────────────────────────
if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];

    $required = ['customer_name', 'customer_phone', 'delivery_address', 'delivery_city', 'items', 'total'];
    foreach ($required as $f) {
        if (empty($body[$f])) jsonError(400, "Campo requerido: $f");
    }

    // Número de pedido único: PI-YYYYMMDD-NNNN
    $date   = date('Ymd');
    $count  = $db->query("SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURDATE()")->fetchColumn();
    $num    = str_pad($count + 1, 4, '0', STR_PAD_LEFT);
    $orderNumber = "PI-{$date}-{$num}";

    // Usuario logueado (opcional)
    $userId = !empty($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;

    $stmt = $db->prepare("
        INSERT INTO orders
          (order_number, user_id, customer_name, customer_phone, customer_email,
           customer_company, delivery_address, delivery_city, delivery_notes, items, total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $orderNumber,
        $userId,
        sanitize($body['customer_name']),
        sanitize($body['customer_phone']),
        sanitize($body['customer_email']  ?? ''),
        sanitize($body['customer_company'] ?? ''),
        sanitize($body['delivery_address']),
        sanitize($body['delivery_city']),
        sanitize($body['delivery_notes']  ?? ''),
        json_encode($body['items'], JSON_UNESCAPED_UNICODE),
        round((float)$body['total'], 2),
    ]);

    jsonSuccess(['order_number' => $orderNumber, 'id' => $db->lastInsertId()], 201);
}

// ── GET: Mis pedidos ──────────────────────────────────────
if ($method === 'GET') {
    $action = $_GET['user'] ?? '';
    $number = $_GET['number'] ?? '';

    if ($action === 'me') {
        if (empty($_SESSION['user_id'])) jsonError(401, 'No autenticado');
        $stmt = $db->prepare("
            SELECT id, order_number, customer_name, total, status, created_at, items, delivery_city, status_note
            FROM orders WHERE user_id = ? ORDER BY created_at DESC
        ");
        $stmt->execute([$_SESSION['user_id']]);
        $orders = $stmt->fetchAll();
        foreach ($orders as &$o) $o['items'] = json_decode($o['items'], true);
        jsonSuccess(['orders' => $orders]);
    }

    if ($number) {
        $stmt = $db->prepare("SELECT * FROM orders WHERE order_number = ?");
        $stmt->execute([$number]);
        $order = $stmt->fetch();
        if (!$order) jsonError(404, 'Pedido no encontrado');
        $order['items'] = json_decode($order['items'], true);
        jsonSuccess(['order' => $order]);
    }

    jsonError(400, 'Parámetro inválido');
}

jsonError(405, 'Método no permitido');
