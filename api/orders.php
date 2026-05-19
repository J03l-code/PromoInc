<?php
/**
 * PromoInc — API de Pedidos
 * POST   → Crear nuevo pedido (público, desde checkout)
 * GET ?user=me → Pedidos del usuario logueado
 * GET ?number=PI-XXX → Detalle por número
 */
require_once __DIR__ . '/config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// ── POST: Crear pedido ────────────────────────────────────
if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];

    $required = ['customer_name', 'customer_phone', 'delivery_address', 'delivery_city', 'items', 'total'];
    foreach ($required as $f) {
        if (empty($body[$f]))
            jsonError(400, "Campo requerido: $f");
    }

    // Número de pedido único: PI-YYYYMMDD-NNNN
    $date = date('Ymd');
    $count = $db->query("SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURDATE()")->fetchColumn();
    $num = str_pad($count + 1, 4, '0', STR_PAD_LEFT);
    $orderNumber = "PI-{$date}-{$num}";

    // Usuario logueado (obligatorio)
    $userId = !empty($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : null;
    if (!$userId) {
        jsonError(401, 'Debes iniciar sesión para realizar un pedido');
    }

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
        sanitize($body['customer_email'] ?? ''),
        sanitize($body['customer_company'] ?? ''),
        sanitize($body['delivery_address']),
        sanitize($body['delivery_city']),
        sanitize($body['delivery_notes'] ?? ''),
        json_encode($body['items'], JSON_UNESCAPED_UNICODE),
        round((float) $body['total'], 2),
    ]);

    $orderId = $db->lastInsertId();

    // ── Enviar Email al Administrador ─────────────────────────
    try {
        $stmtSettings = $db->query("SELECT `value` FROM settings WHERE `key` = 'site_email'");
        $emailRow = $stmtSettings->fetch();
        $adminEmail = $emailRow ? $emailRow['value'] : 'ventas@promoinc.ec';

        $subject = "Nuevo Pedido Confirmado: {$orderNumber}";
        
        $itemsHtml = '';
        foreach($body['items'] as $item) {
            $subtotal = number_format($item['price'] * $item['quantity'], 2);
            $itemsHtml .= "
            <tr>
                <td style='padding: 10px; border-bottom: 1px solid #ddd;'>" . htmlspecialchars($item['name']) . "</td>
                <td style='padding: 10px; border-bottom: 1px solid #ddd; text-align: center;'>" . (int)$item['quantity'] . "</td>
                <td style='padding: 10px; border-bottom: 1px solid #ddd; text-align: right;'>$" . number_format($item['price'], 2) . "</td>
                <td style='padding: 10px; border-bottom: 1px solid #ddd; text-align: right;'>$" . $subtotal . "</td>
            </tr>";
        }

        $totalHtml = number_format((float)$body['total'], 2);
        
        $htmlEmail = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eee; border-radius: 8px; overflow: hidden;'>
            <div style='background: #121212; padding: 20px; text-align: center;'>
                <img src='https://promoinc.ec/assets/images/logo%20blanco%20(2).png' alt='PromoInc' style='height: 50px;'>
            </div>
            <div style='padding: 30px; background: #fafafa;'>
                <h2 style='color: #e83e8c; margin-top: 0; font-size: 24px; text-align: center;'>¡Nuevo Pedido Recibido!</h2>
                <div style='background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); margin-bottom: 20px;'>
                    <p style='margin: 0 0 10px;'><strong>Nro. de Pedido:</strong> <span style='color: #00bcff;'>" . htmlspecialchars($orderNumber) . "</span></p>
                    <p style='margin: 0 0 10px;'><strong>Cliente:</strong> " . htmlspecialchars($body['customer_name']) . "</p>
                    <p style='margin: 0 0 10px;'><strong>Empresa:</strong> " . htmlspecialchars($body['customer_company'] ?? 'N/A') . "</p>
                    <p style='margin: 0 0 10px;'><strong>Teléfono:</strong> " . htmlspecialchars($body['customer_phone']) . "</p>
                    <p style='margin: 0 0 0;'><strong>Email:</strong> " . htmlspecialchars($body['customer_email'] ?? 'N/A') . "</p>
                </div>
                
                <h3 style='margin-bottom: 15px; color: #121212; border-bottom: 2px solid #00bcff; padding-bottom: 5px; display: inline-block;'>Dirección de Entrega</h3>
                <p style='margin: 0 0 5px; font-weight: bold;'>" . htmlspecialchars($body['delivery_address']) . "</p>
                <p style='margin: 0 0 15px;'>" . htmlspecialchars($body['delivery_city']) . "</p>
                <p style='margin: 0; padding: 10px; background: #fff3cd; border-left: 4px solid #ffc107; color: #856404;'><em>Notas: " . htmlspecialchars($body['delivery_notes'] ?? 'Ninguna') . "</em></p>
                
                <h3 style='margin: 30px 0 15px; color: #121212; border-bottom: 2px solid #e83e8c; padding-bottom: 5px; display: inline-block;'>Detalle de Productos</h3>
                <table style='width: 100%; border-collapse: collapse; margin-bottom: 20px; background: #fff;'>
                    <thead>
                        <tr style='background: #f1f1f1;'>
                            <th style='padding: 12px 10px; text-align: left; border-bottom: 2px solid #ddd;'>Producto</th>
                            <th style='padding: 12px 10px; text-align: center; border-bottom: 2px solid #ddd;'>Cant.</th>
                            <th style='padding: 12px 10px; text-align: right; border-bottom: 2px solid #ddd;'>P. Unit</th>
                            <th style='padding: 12px 10px; text-align: right; border-bottom: 2px solid #ddd;'>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {$itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan='3' style='padding: 15px 10px; text-align: right; font-weight: bold; font-size: 16px;'>Total a Pagar:</td>
                            <td style='padding: 15px 10px; text-align: right; font-weight: bold; color: #e83e8c; font-size: 18px;'>\${$totalHtml}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <div style='background: #121212; color: #aaa; text-align: center; padding: 20px; font-size: 12px;'>
                &copy; " . date('Y') . " PromoInc. Este es un correo automático generado por el sistema.
            </div>
        </div>
        ";

        $fromEmail = 'ventas@promoinc.ec'; // Debe ser un correo del mismo dominio hospedado para no ser bloqueado por SPF/Hostinger
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "From: PromoInc Web <" . $fromEmail . ">\r\n";
        if (!empty($body['customer_email'])) {
            $headers .= "Reply-To: " . filter_var($body['customer_email'], FILTER_SANITIZE_EMAIL) . "\r\n";
        }

        $mailSent = @mail($adminEmail, $subject, $htmlEmail, $headers, "-f" . $fromEmail);
        if (!$mailSent) {
            error_log("Failed to send order email to {$adminEmail}");
        }
    } catch (\Throwable $e) {
        // Ignorar errores de envío de correo para no bloquear la creación del pedido
    }

    jsonSuccess(['order_number' => $orderNumber, 'id' => $orderId], 201);
}

// ── GET: Mis pedidos ──────────────────────────────────────
if ($method === 'GET') {
    $action = $_GET['user'] ?? '';
    $number = $_GET['number'] ?? '';

    if ($action === 'me') {
        if (empty($_SESSION['user_id']))
            jsonError(401, 'No autenticado');
        $stmt = $db->prepare("
            SELECT id, order_number, customer_name, total, status, created_at, items, delivery_city, status_note
            FROM orders WHERE user_id = ? ORDER BY created_at DESC
        ");
        $stmt->execute([$_SESSION['user_id']]);
        $orders = $stmt->fetchAll();
        foreach ($orders as &$o)
            $o['items'] = json_decode($o['items'], true);
        jsonSuccess(['orders' => $orders]);
    }

    if ($number) {
        if (empty($_SESSION['user_id'])) jsonError(401, 'No autenticado');
        $stmt = $db->prepare("SELECT * FROM orders WHERE order_number = ? AND user_id = ?");
        $stmt->execute([$number, $_SESSION['user_id']]);
        $order = $stmt->fetch();
        if (!$order)
            jsonError(404, 'Pedido no encontrado o no tienes permiso para verlo');
        $order['items'] = json_decode($order['items'], true);
        jsonSuccess(['order' => $order]);
    }

    jsonError(400, 'Parámetro inválido');
}

jsonError(405, 'Método no permitido');
