<?php
/**
 * PromoInc — API Admin: CRM de Clientes (protegida)
 * GET    → Lista de clientes consolidados (usuarios + invitados con pedidos)
 * GET ?id=X → Detalle de cliente y sus pedidos
 */
require_once __DIR__ . '/middleware.php';
requireAdmin();

$db     = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $id = $_GET['id'] ?? null;

    if ($id) {
        // Buscar si es un usuario registrado
        $stmt = $db->prepare("SELECT id, name, email, phone, role, created_at, last_login FROM users WHERE id = ?");
        $stmt->execute([$id]);
        $client = $stmt->fetch();

        // Obtener historial de pedidos
        // Si es usuario registrado, buscamos por user_id. 
        // Si no (para manejar futuros invitados que se agrupan por email), buscaríamos por email, 
        // pero por ahora usemos user_id
        if ($client) {
            $stmtOrders = $db->prepare("SELECT id, order_number, total, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC");
            $stmtOrders->execute([$id]);
            $client['orders'] = $stmtOrders->fetchAll();
            jsonSuccess(['client' => $client]);
        } else {
            jsonError(404, 'Cliente no encontrado');
        }
    }

    // Lista de clientes
    // Unimos los usuarios registrados que son 'client' con datos agregados de sus pedidos
    $sql = "
        SELECT 
            u.id, 
            u.name, 
            u.email, 
            COALESCE(u.phone, MAX(o.customer_phone)) as phone,
            u.created_at,
            COUNT(o.id) as total_orders,
            MAX(o.created_at) as last_order_date
        FROM users u
        LEFT JOIN orders o ON o.user_id = u.id
        WHERE u.role = 'client'
        GROUP BY u.id
        ORDER BY last_order_date DESC, u.created_at DESC
    ";
    
    $stmt = $db->query($sql);
    $clients = $stmt->fetchAll();

    jsonSuccess(['clients' => $clients]);
}

jsonError(405, 'Método no permitido');
